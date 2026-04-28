import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import convert from "heic-convert";
import { readPosts, writePosts } from "@/data/posts";
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  deriveBlogExcerpt,
  getBlogImageIdentity,
  parseOrderedImages,
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
      })) as unknown as Buffer;

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
      console.error("S3 upload failed, falling back to local", err);
      const dest = path.join(uploadDir, filename);
      await fs.writeFile(dest, webBuffer);
      return `/uploads/${filename}`;
    }
  }

  const dest = path.join(uploadDir, filename);
  await fs.writeFile(dest, webBuffer);
  return `/uploads/${filename}`;
}

function reorderImages(images: string[], orderedImages: string[]) {
  if (!orderedImages.length) return images;

  const orderMap = new Map(
    orderedImages.map((src, index) => [getBlogImageIdentity(src), index])
  );

  return [...images].sort((a, b) => {
    const indexA = orderMap.get(getBlogImageIdentity(a)) ?? Number.MAX_SAFE_INTEGER;
    const indexB = orderMap.get(getBlogImageIdentity(b)) ?? Number.MAX_SAFE_INTEGER;
    return indexA - indexB;
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const posts = await readPosts();
  const filtered = posts.filter((p) => p.id !== id);
  await writePosts(filtered);
  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const formData = await request.formData();
  const meta = readBlogPostFormData(formData);
  const orderedImages = parseOrderedImages(formData.get("orderedImages"));

  const deletedRaw = formData.get("deletedImages")?.toString() || "[]";
  let deletedImages: string[] = [];
  try {
    deletedImages = JSON.parse(deletedRaw);
    if (!Array.isArray(deletedImages)) deletedImages = [];
  } catch {
    deletedImages = [];
  }

  const files = formData.getAll("images") as File[];

  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const post = posts[idx];
  const uploadDir = await ensureUploadsDir();

  const deletedIdentitySet = new Set(deletedImages.map(getBlogImageIdentity));

  for (const name of deletedImages) {
    const safeName = path.basename(getBlogImageIdentity(name));
    const target = path.join(uploadDir, safeName);
    try {
      await fs.unlink(target);
    } catch {
      // ignore
    }
  }

  const retainedExisting = (post.images || []).filter(
    (src) => !deletedIdentitySet.has(getBlogImageIdentity(src))
  );
  const reorderedExisting = reorderImages(retainedExisting, orderedImages);
  const newImages: string[] = [];

  for (const file of files) {
    newImages.push(await processUpload(file, uploadDir));
  }

  post.images = [...reorderedExisting, ...newImages];
  post.coverImage = post.images[0] || "";
  post.title = meta.title;
  post.body = meta.body;
  post.excerpt = meta.excerpt || deriveBlogExcerpt(meta.body);
  post.featured = meta.featured;
  post.status = meta.status;
  post.tags = meta.tags;
  post.publishedAt = meta.publishedAt || post.publishedAt || new Date().toISOString();

  posts[idx] = post;
  await writePosts(posts);

  try {
    await imageQueue.add(
      "process-images",
      { postId: id, files: post.images },
      {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 1000,
      }
    );
  } catch (err) {
    console.error("Failed to enqueue image processing job", err);
  }

  return NextResponse.json(post);
}
