"use client";

import React from "react";
import StaticImg from "@/components/StaticImg";

export default function PostImages({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {images.map((src, i) => {
        const filename = src.replace(/^\/uploads\//, "");
        const url = src.startsWith("/uploads/")
          ? `/api/uploads/${filename}`
          : src;

        return (
          <button
            key={src}
            onClick={() => {
              const ev = new CustomEvent<{ images: string[]; index: number }>(
                "openLightbox",
                { detail: { images, index: i } }
              );
              window.dispatchEvent(ev);
            }}
            className="block w-full aspect-square bg-gray-100 overflow-hidden rounded-lg"
          >
            <StaticImg
              src={url}
              alt={`image-${i}`}
              width={400}
              height={400}
              className="w-full h-full object-cover hover:scale-110 cursor-pointer transition-transform ease-in-out"
            />
          </button>
        );
      })}
    </div>
  );
}
