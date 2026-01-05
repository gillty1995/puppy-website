"use client";

import React, { useEffect, useState } from "react";
import StaticImg from "@/components/StaticImg";

export default function Lightbox() {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function onOpen(e: Event) {
      const detail =
        (e as CustomEvent<{ images?: string[]; index?: number }>).detail || {};
      const imgs = detail.images || [];
      const idx = detail.index;
      const mapped = (imgs || []).map((s: string) => {
        const cdn = process.env.NEXT_PUBLIC_CDN_URL || "";
        if (s.startsWith("/uploads/")) {
          const filename = s.replace(/^\/uploads\//, "");
          return cdn ? `${cdn}/${filename}` : `/api/uploads/${filename}`;
        }
        if (/^uploads\//.test(s)) {
          return cdn
            ? `${cdn}/${s}`
            : `/api/uploads/${s.replace(/^uploads\//, "")}`;
        }
        return s;
      });
      setImages(mapped);
      setIndex(typeof idx === "number" ? idx : 0);
      setOpen(true);
    }

    window.addEventListener("openLightbox", onOpen as EventListener);
    return () =>
      window.removeEventListener("openLightbox", onOpen as EventListener);
  }, []);

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

  if (!open) return null;

  return (
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
        onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
        className="absolute left-6 text-white text-4xl cursor-pointer"
        aria-label="Previous image"
      >
        ‹
      </button>

      <div className="max-w-[90vw] max-h-[85vh]">
        <StaticImg
          src={images[index]}
          alt={`large-${index}`}
          width={1200}
          height={800}
          className="w-full h-auto max-h-[85vh] object-contain"
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
  );
}
