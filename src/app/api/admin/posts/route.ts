/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import convert from "heic-convert";
import { readPosts, writePosts, Post } from "@/data/posts";

export const config = {
  api: {
    bodyParser: false, // raw multipart needed
  },
};

async function ensureUploadsDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

// LIST POSTS
export async function GET() {
  const posts = await readPosts();
  return NextResponse.json(posts);
}

// UPLOAD POSTS
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const title = formData.get("title")?.toString() || "";
  const body = formData.get("body")?.toString() || "";
  const files = formData.getAll("images") as File[];

  const uploadDir = await ensureUploadsDir();
  const imageUrls: string[] = [];

  for (const file of files) {
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    let webBuffer: Buffer;

    // if it’s HEIC/HEIF → convert with heic-convert
    if (
      /\.heic$/i.test(file.name) ||
      file.type === "image/heic" ||
      file.type === "image/heif"
    ) {
      try {
      // @ts-ignore: heic-convert accepts a Buffer at runtime
        const jpegBuf = await convert({
          buffer: rawBuffer as unknown as ArrayBufferLike,
          format: "JPEG",       // output format
          quality: 0.8,         // between 0 and 1
        });
        // run through sharp too for EXIF-orientation & resizing
        webBuffer = await sharp(jpegBuf)
          .rotate()
          .resize({ width: 1200 })   
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch (err) {
        console.error("HEIC conversion failed:", err);
        webBuffer = rawBuffer; // fallback—at least we wrote something
      }
    } else {
      // non-HEIC → sharp rotate & compress
      webBuffer = await sharp(rawBuffer)
        .rotate()              // respect orientation data
        .jpeg({ quality: 80 }) // compress to ~80%
        // .resize({ width: 1920 }) // optional cap
        .toBuffer();
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}.jpg`;
    const dest = path.join(uploadDir, filename);
    await fs.writeFile(dest, webBuffer);
    imageUrls.push(`/uploads/${filename}`);
  }

  // prepend post
  const posts = await readPosts();
  const newPost: Post = {
    id: Date.now().toString(),
    title,
    body,
    images: imageUrls,
    comments: [],
  };
  posts.unshift(newPost);
  await writePosts(posts);

  return NextResponse.json(newPost);
}