// src/components/PostImages.tsx
"use client";

import React from "react";
import StaticImg from "@/components/StaticImg";

function normalizeToKey(img: string) {
  if (!img) return "";

  if (img.startsWith("http://") || img.startsWith("https://")) {
    try {
      const u = new URL(img);
      return u.pathname.replace(/^\/+/, "");
    } catch {
      return img.replace(/^\/+/, "");
    }
  }

  return img.replace(/^\/+/, "");
}

function toApiUrl(img: string) {
  const key = normalizeToKey(img);
  return key ? `/api/uploads/${key}` : img;
}

export default function PostImages({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  const lightboxImages = images.map((img) => toApiUrl(img));

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
      {images.map((src, i) => {
        const url = toApiUrl(src);

        return (
          <button
            key={`${src}-${i}`}
            onClick={() => {
              const ev = new CustomEvent<{ images: string[]; index: number }>(
                "openLightbox",
                {
                  detail: { images: lightboxImages, index: i },
                }
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
