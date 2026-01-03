"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StaticImg from "@/components/StaticImg";
import Lightbox from "@/components/Lightbox";

interface Post {
  id: string;
  title: string;
  body: string;
  images: string[];
  imageUrl?: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts);
  }, []);

  return (
    <section id="blog" className="py-16 bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/#home"
          className="text-blue-600 hover:underline block mb-8"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-serif text-gray-900 mb-8 text-center max-sm:mt-10">
          Puppy Blog
        </h1>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {posts.map((p) => {
            const imgs = p.images?.length
              ? p.images
              : p.imageUrl
              ? [p.imageUrl]
              : [];

            const thumbSrc = imgs.length
              ? `/api/uploads/${imgs[0].replace(/^\/uploads\//, "")}`
              : "/images/coming-soon.jpg";

            return (
              <Link
                key={p.id}
                href={`/blog/${p.id}`}
                className="block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-transform transform hover:scale-105"
              >
                <div className="block w-full aspect-square bg-zinc-100 overflow-hidden pointer-events-none">
                  <StaticImg
                    src={thumbSrc}
                    alt={p.title}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {p.body.length > 100
                      ? p.body.slice(0, 100).trim() + "…"
                      : p.body}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        <Lightbox />
      </div>
    </section>
  );
}
