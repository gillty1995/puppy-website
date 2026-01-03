"use client";

import React, { useEffect, useState } from "react";

interface PuppyLightboxProps {
  images: string[];
}

export default function PuppyLightbox({ images }: PuppyLightboxProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open || images.length === 0) return;
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

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
              setIndex(i);
              setOpen(true);
            }}
            className="block w-full overflow-hidden rounded-lg group cursor-pointer transform hover:scale-105 transition"
          >
            <div className="aspect-square w-full bg-gray-100 overflow-hidden rounded-lg">
              <img
                src={src}
                alt={`puppy-${i}`}
                className="w-full h-full object-cover"
              />
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute top-6 right-6 text-white text-3xl cursor-pointer"
            onClick={() => setOpen(false)}
            aria-label="Close gallery"
          >
            ×
          </button>

          <button
            onClick={() =>
              setIndex((i) => (i - 1 + images.length) % images.length)
            }
            className="absolute left-6 text-white text-4xl cursor-pointer"
            aria-label="Previous image"
          >
            ‹
          </button>

          <div className="max-w-[90vw] max-h-[85vh]">
            <img
              src={images[index]}
              alt={`large-${index}`}
              className="w-full h-auto max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-6 text-white text-4xl cursor-pointer"
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
