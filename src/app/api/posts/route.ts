// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getAllPosts } from "@/data/posts";

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json(posts);
}