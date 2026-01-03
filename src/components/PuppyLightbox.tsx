"use client";

import React from "react";
import StaticImg from "@/components/StaticImg";
import Lightbox from "@/components/Lightbox";

interface PuppyLightboxProps {
  images: string[];
}

export default function PuppyLightbox({ images }: PuppyLightboxProps) {
  if (!images || images.length === 0) {
    return (
      <div className="text-center text-gray-600">No images available.</div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => {
              const ev = new CustomEvent<{ images: string[]; index: number }>(
                "openLightbox",
                { detail: { images, index: i } }
              );
              window.dispatchEvent(ev);
            }}
            className="block w-full overflow-hidden rounded-lg group cursor-pointer transform hover:scale-105 transition"
            aria-label={`Open image ${i + 1}`}
          >
            <div className="aspect-square w-full bg-gray-100 overflow-hidden rounded-lg">
              <StaticImg
                src={src}
                alt={`puppy-${i}`}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        ))}
      </div>

      {/* shared client-side lightbox component listens for openLightbox */}
      <Lightbox />
    </div>
  );
}
