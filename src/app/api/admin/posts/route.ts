import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readPosts, writePosts, Post } from "@/data/posts";

export const config = {
  api: {
    bodyParser: false, // we need raw multipart for file uploads
  },
};

// ensure /public/uploads exists
async function ensureUploadsDir(): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
}

// GET /api/admin/posts → list all posts
export async function GET() {
  const posts = await readPosts();
  return NextResponse.json(posts);
}

// POST /api/admin/posts → receive formData, save files, prepend new post
export async function POST(request: NextRequest) {
  // parse incoming multipart form
  const formData = await request.formData();
  const title = formData.get("title")?.toString() || "";
  const body = formData.get("body")?.toString() || "";
  const files = formData.getAll("images") as File[];

  // save each file to /public/uploads
  const uploadDir = await ensureUploadsDir();
  const imageUrls: string[] = [];

  for (const file of files) {
    const name = file.name || `upload-${Date.now()}`;
    const filename = `${Date.now()}-${name}`;
    const dest = path.join(uploadDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(dest, Buffer.from(arrayBuffer));
    imageUrls.push(`/uploads/${filename}`);
  }

  // read existing, add new post at the front, write back
  const posts = await readPosts();
  const newPost: Post = {
    id: Date.now().toString(),
    title,
    body,
    images: imageUrls,
    comments: []
  };
  posts.unshift(newPost);
  await writePosts(posts);

  return NextResponse.json(newPost);
}