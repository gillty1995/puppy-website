import fs from "fs";
import path from "path";
import React from "react";
import Link from "next/link";

import PuppyLightbox from "@/components/PuppyLightbox";

const POSTS_DIR = path.join(process.cwd(), "src", "data");

export default async function PuppyPage({
  params,
}: {
  params: Promise<{ litter: string; puppy: string }>;
}) {
  const { litter, puppy } = await params;
  const imagesDir = path.join(process.cwd(), "public", "images");
  let files: string[] = [];
  try {
    files = fs.readdirSync(imagesDir);
  } catch {
    files = [];
  }

  const matches = files
    .filter((f) => f.toLowerCase().includes(puppy.toLowerCase()))
    .map((f) => `/images/${f}`);

  type Post = { id?: string; title?: string; body?: string };
  let posts: Post[] = [];
  try {
    const postsJson = path.join(POSTS_DIR, "posts.json");
    if (fs.existsSync(postsJson)) {
      const raw = fs.readFileSync(postsJson, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        posts = (parsed as unknown[])
          .map((item) => item as Post)
          .filter((post) => {
            const text = (post.title || "") + " " + (post.body || "");
            return text.toLowerCase().includes(puppy.toLowerCase());
          });
      }
    }
  } catch {
    posts = [];
  }

  return (
    <section className="py-16 bg-gray-50 px-6 md:px-20 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/previous-litters/${litter}`}
          className="text-blue-600 hover:underline block mb-8"
        >
          &larr; Back to Puppies of{" "}
          {litter
            .replace(/-/g, " ")
            .split(" ")
            .map((w: string) =>
              w ? w.charAt(0).toUpperCase() + w.slice(1) : w
            )
            .join(" ")}
        </Link>

        <h1 className="text-6xl font-serif text-gray-900 mb-8 text-center">
          {puppy.charAt(0).toUpperCase() + puppy.slice(1)}
        </h1>

        <PuppyLightbox images={matches} />

        <div className="mt-12">
          <h2 className="text-4xl font-serif text-gray-900 mb-4">
            Blog posts related to{" "}
            {puppy.charAt(0).toUpperCase() + puppy.slice(1)}
          </h2>
          {posts.length ? (
            <ul className="list-disc pl-6">
              {posts.map((post: Post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No related posts found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
