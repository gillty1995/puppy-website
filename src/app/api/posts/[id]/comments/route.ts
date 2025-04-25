import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readPosts, writePosts, Comment } from "@/data/posts";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { email, comment } = await request.json();

  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const newComment: Comment = {
    email,
    comment,
    createdAt: new Date().toISOString(),
  };

  posts[idx].comments = posts[idx].comments ?? [];
  posts[idx].comments.push(newComment);
  await writePosts(posts);

  return NextResponse.json(newComment);
}

// Optional: allow fetching comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const posts = await readPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json(post.comments ?? []);
}