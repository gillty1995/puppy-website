// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { getAllPosts } from "@/data/posts";
import { sortBlogPosts } from "@/lib/blog";

export async function GET() {
  const posts = await getAllPosts();
  return NextResponse.json(
    sortBlogPosts(posts.filter((post) => post.status === "published"))
  );
}
