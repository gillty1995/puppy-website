import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readPosts, writePosts } from "@/data/posts";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const posts = await readPosts();
  const filtered = posts.filter((p) => p.id !== params.id);
  await writePosts(filtered);
  return NextResponse.json({ success: true });
}