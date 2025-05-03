// components/CommentsWrapper.tsx
"use client";

import dynamic from "next/dynamic";

const CommentsSection = dynamic(() => import("@/components/CommentSection"), {
  ssr: false,
});

export default function CommentsWrapper({ postId }: { postId: string }) {
  return <CommentsSection postId={postId} />;
}
