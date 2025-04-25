"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

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

        <div className="grid gap-8">
          {posts.map((p) => {
            const imgs = p.images?.length
              ? p.images
              : p.imageUrl
              ? [p.imageUrl]
              : [];

            return (
              <Link
                key={p.id}
                href={`/blog/${p.id}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {p.title}
                </h2>

                {imgs.map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt={p.title}
                    width={400}
                    height={580}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                ))}

                <p className="text-gray-700">
                  {p.body.length > 150
                    ? p.body.slice(0, 150).trim() + "…"
                    : p.body}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
