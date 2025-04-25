import { NextResponse } from "next/server";
import { readPosts, writePosts } from "@/data/posts";

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