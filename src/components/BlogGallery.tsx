"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import StaticImg from "@/components/StaticImg";
import { resolveBlogImageSrc } from "@/lib/blog";

type BlogGalleryProps = {
  images: string[];
  title: string;
};

export default function BlogGallery({ images, title }: BlogGalleryProps) {
  const imageSignature = images.join("|");
  const resolvedImages = useMemo(
    () => images.map((src) => resolveBlogImageSrc(src)),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const swipeStartX = useRef<number | null>(null);
  const swipePointerId = useRef<number | null>(null);
  const suppressNextClick = useRef(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [imageSignature]);

  useEffect(() => {
    if (!isModalOpen || resolvedImages.length === 0) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % resolvedImages.length);
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex(
          (index) => (index - 1 + resolvedImages.length) % resolvedImages.length
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen, resolvedImages.length]);

  if (resolvedImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-100">
        <div className="flex aspect-[4/3] items-center justify-center text-sm text-stone-500">
          No images yet
        </div>
      </div>
    );
  }

  const activeImage = resolvedImages[activeIndex] || resolvedImages[0];

  function showPrevious() {
    setActiveIndex(
      (index) => (index - 1 + resolvedImages.length) % resolvedImages.length
    );
  }

  function showNext() {
    setActiveIndex((index) => (index + 1) % resolvedImages.length);
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    suppressNextClick.current = false;
    swipePointerId.current = event.pointerId;
    swipeStartX.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (swipePointerId.current !== event.pointerId || swipeStartX.current === null) {
      return;
    }

    const delta = event.clientX - swipeStartX.current;
    swipeStartX.current = null;
    swipePointerId.current = null;

    if (Math.abs(delta) < 48) return;
    suppressNextClick.current = true;
    if (delta < 0) showNext();
    else showPrevious();
  }

  return (
    <>
      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div
          role="button"
          tabIndex={0}
          onClick={() => {
            if (suppressNextClick.current) {
              suppressNextClick.current = false;
              return;
            }
            setIsModalOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setIsModalOpen(true);
            }
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipeStartX.current = null;
            swipePointerId.current = null;
          }}
          className="group relative block w-full cursor-pointer overflow-hidden bg-stone-100 text-left"
          aria-label={`Open gallery for ${title}`}
        >
          <div className="relative aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[4/3]">
            <StaticImg
              src={activeImage}
              alt={title}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 text-white">
              <span className="rounded-full bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] backdrop-blur">
                {activeIndex + 1} / {resolvedImages.length}
              </span>
              <span className="hidden rounded-full bg-black/35 px-3 py-1 text-xs font-medium backdrop-blur md:inline-flex">
                Tap to open
              </span>
            </div>

            {resolvedImages.length > 1 ? (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    showPrevious();
                  }}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-white/90 px-5 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-white"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    showNext();
                  }}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-white/90 px-5 text-sm font-semibold text-gray-900 shadow-lg transition hover:bg-white"
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {resolvedImages.length > 1 ? (
          <div className="border-t border-stone-200 bg-white p-4">
            <div className="flex gap-3 overflow-x-auto pb-1">
              {resolvedImages.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative shrink-0 cursor-pointer overflow-hidden rounded-2xl border transition ${
                    index === activeIndex
                      ? "border-emerald-500 ring-2 ring-emerald-200"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                    <StaticImg
                      src={src}
                      alt={`${title} thumbnail ${index + 1}`}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/90 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="mx-auto flex h-full max-w-7xl flex-col">
            <div className="mb-4 flex items-center justify-between gap-4 text-white">
              <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                {activeIndex + 1} / {resolvedImages.length}
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-0 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur transition hover:bg-white/20 md:block"
                aria-label="Previous image"
              >
                ←
              </button>

              <div
                className="relative flex h-full w-full items-center justify-center"
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  swipeStartX.current = null;
                  swipePointerId.current = null;
                }}
              >
                <div className="relative h-full w-full max-w-6xl">
                  <StaticImg
                    src={activeImage}
                    alt={`${title} full screen ${activeIndex + 1}`}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={showNext}
                className="absolute right-0 top-1/2 hidden -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur transition hover:bg-white/20 md:block"
                aria-label="Next image"
              >
                →
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
