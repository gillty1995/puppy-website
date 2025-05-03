// components/StaticImg.tsx
"use client";
import Image, { ImageLoader } from "next/image";

const passthroughLoader: ImageLoader = ({ src }) => src;

export default function StaticImg(
  props: Omit<React.ComponentProps<typeof Image>, "loader">
) {
  return <Image {...props} loader={passthroughLoader} unoptimized />;
}
