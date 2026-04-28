import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import convert from "heic-convert";
import { readPosts, writePosts, Post } from "@/data/posts";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  deriveBlogExcerpt,
  readBlogPostFormData,
} from "@/lib/blog";
import { requireAdminApi } from "@/lib/admin";

sharp.cache(false);
sharp.concurrency(1);

const _redisConn = new IORedis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379"
);
const imageQueue = new Queue(
  process.env.IMAGE_QUEUE_NAME || "image-processing",
  { connection: _redisConn }
);

const S3_BUCKET = process.env.S3_BUCKET || "";
const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION || "us-east-1";
const S3_PREFIX = (process.env.S3_PREFIX || "").replace(/^\/|\/$/g, "");
const s3Client = S3_BUCKET ? new S3Client({ region: S3_REGION }) : null;

export const config = {
  api: { bodyParser: false },
};

async function ensureUploadsDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

async function processUpload(file: File, uploadDir: string) {
  const rawBuffer = Buffer.from(await file.arrayBuffer());
  let webBuffer: Buffer;

  const isHeic =
    /\.heic$/i.test(file.name) ||
    file.type === "image/heic" ||
    file.type === "image/heif";

  try {
    if (isHeic) {
      const jpegBuf = (await convert({
        buffer: rawBuffer as unknown as ArrayBufferLike,
        format: "JPEG",
        quality: 0.8,
      })) as Buffer;

      webBuffer = await sharp(jpegBuf, { limitInputPixels: false })
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } else {
      webBuffer = await sharp(rawBuffer, { limitInputPixels: false })
        .rotate()
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    }
  } catch (err) {
    console.error("image processing failed, using original buffer:", err);
    webBuffer = rawBuffer;
  }

  const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}.jpg`;

  if (s3Client && S3_BUCKET) {
    const key = `${S3_PREFIX ? `${S3_PREFIX}/` : ""}uploads/${filename}`;
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: key,
          Body: webBuffer,
          ContentType: "image/jpeg",
        })
      );
      try {
        await fs.writeFile(path.join(uploadDir, filename), webBuffer);
      } catch (err) {
        console.warn("failed to mirror uploaded image locally", err);
      }
      return key;
    } catch (err) {
      console.error("failed to upload to s3, falling back to local write", err);
      const dest = path.join(uploadDir, filename);
      await fs.writeFile(dest, webBuffer);
      return `/uploads/${filename}`;
    }
  }

  const dest = path.join(uploadDir, filename);
  await fs.writeFile(dest, webBuffer);
  return `/uploads/${filename}`;
}

// LIST POSTS
export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const posts = await readPosts();
  return NextResponse.json(posts);
}

// UPLOAD POSTS
export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const meta = readBlogPostFormData(formData);
  const files = formData.getAll("images") as File[];

  const uploadDir = await ensureUploadsDir();
  const imageUrls: string[] = [];

  for (const file of files) {
    imageUrls.push(await processUpload(file, uploadDir));
  }

  const posts = await readPosts();
  const now = new Date().toISOString();
  const newPost: Post = {
    id: Date.now().toString(),
    title: meta.title,
    body: meta.body,
    images: imageUrls,
    comments: [],
    excerpt: meta.excerpt || deriveBlogExcerpt(meta.body),
    coverImage: imageUrls[0] || "",
    featured: meta.featured,
    status: meta.status,
    publishedAt: meta.publishedAt || now,
    tags: meta.tags,
  };

  posts.unshift(newPost);
  await writePosts(posts);

  try {
    await imageQueue.add(
      "process-images",
      { postId: newPost.id, files: imageUrls },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 1000,
      }
    );
  } catch (err) {
    console.error("Failed to enqueue image processing job", err);
  }

  return NextResponse.json(newPost);
}
