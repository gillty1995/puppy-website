import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import convert from "heic-convert";
import { readPosts, writePosts } from "@/data/posts";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const posts = await readPosts();
  const filtered = posts.filter((p) => p.id !== id);
  await writePosts(filtered);
  return NextResponse.json({ success: true });
}

async function ensureUploadsDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const title = formData.get("title")?.toString() || "";
  const body = formData.get("body")?.toString() || "";
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

  for (const name of deletedImages) {
    const safeName = path.basename(name);
    const target = path.join(uploadDir, safeName);
    try {
      await fs.unlink(target);
    } catch {
    }
  }

  post.images = post.images.filter((src) => {
    return !deletedImages.some((d) => src.endsWith(d) || src.includes(d));
  });

  for (const file of files) {
    const rawBuffer = Buffer.from(await file.arrayBuffer());
    let webBuffer: Buffer;
    if (/\.heic$/i.test(file.name) || file.type === "image/heic" || file.type === "image/heif") {
      try {
        const jpegBuf = await convert({ buffer: rawBuffer as unknown as ArrayBufferLike, format: "JPEG", quality: 0.8 });
        webBuffer = await sharp(jpegBuf).rotate().resize({ width: 1200 }).jpeg({ quality: 80 }).toBuffer();
      } catch {
        webBuffer = rawBuffer;
      }
    } else {
      try {
        webBuffer = await sharp(rawBuffer).rotate().jpeg({ quality: 80 }).toBuffer();
      } catch {
        webBuffer = rawBuffer;
      }
    }

    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "_")}.jpg`;
    const dest = path.join(uploadDir, filename);
    await fs.writeFile(dest, webBuffer);
    post.images.push(`/uploads/${filename}`);
  }

  post.title = title;
  post.body = body;

  posts[idx] = post;
  await writePosts(posts);

  return NextResponse.json(post);
}