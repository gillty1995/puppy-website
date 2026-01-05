// src/components/StaticImg.tsx
"use client";

import React from "react";
import Image, { ImageLoader } from "next/image";

const passthroughLoader: ImageLoader = ({ src }) => src;

type ImagePropsNoLoader = Omit<React.ComponentProps<typeof Image>, "loader">;

export default function StaticImg(props: ImagePropsNoLoader) {
  const { alt = "", ...rest } = props;
  return (
    <Image
      {...(rest as Omit<ImagePropsNoLoader, "alt">)}
      alt={alt}
      loader={passthroughLoader}
      unoptimized
    />
  );
}
