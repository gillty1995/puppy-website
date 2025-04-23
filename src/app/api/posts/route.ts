// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { readPosts } from "@/data/posts";

export async function GET() {
  const posts = await readPosts();
  return NextResponse.json(posts);
}