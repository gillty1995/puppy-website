import fs from "fs";
import path from "path";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const LITTER_PUPPIES: Record<string, { slug: string; name: string }[]> = {
  "litter-2025": [
    { slug: "canvas", name: "Canvas" },
    { slug: "cotton", name: "Cotton" },
  ],
};

export default async function LitterPage({
  params,
}: {
  params: Promise<{ litter: string }>;
}) {
  const { litter } = await params;
  const puppies = LITTER_PUPPIES[litter] || [];

  const imagesDir = path.join(process.cwd(), "public", "images");
  let files: string[] = [];
  try {
    files = fs.readdirSync(imagesDir);
  } catch (e) {
    files = [];
  }

  const puppyData = puppies.map((p) => {
    const matches = files
      .filter((f) => f.toLowerCase().includes(p.slug.toLowerCase()))
      .map((f) => `/images/${f}`);

    return {
      slug: p.slug,
      name: p.name,
      images: matches,
      thumb: matches.length ? matches[0] : "/images/coming-soon.jpg",
    };
  });

  return (
    <section
      id="litter"
      className="py-16 bg-gray-50 px-6 md:px-20 min-h-screen"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/previous-litters"
          className="text-blue-600 hover:underline block mb-8"
        >
          &larr; Back to Previous Litters
        </Link>

        <h1 className="text-4xl font-serif text-gray-900 mb-8 text-center max-sm:mt-10">
          {litter
            .replace(/-/g, " ")
            .split(" ")
            .map((w: string) =>
              w ? w.charAt(0).toUpperCase() + w.slice(1) : w
            )
            .join(" ")}{" "}
          Gallery
        </h1>

        <p className="text-gray-700 mb-8">
          Click a puppy to view that puppy's gallery and related blog posts.
        </p>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {puppyData.map((p) => (
            <Link
              key={p.slug}
              href={`/previous-litters/${litter}/${p.slug}`}
              className="group block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <div className="aspect-square w-full bg-zinc-100">
                <Image
                  src={p.thumb}
                  alt={p.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {p.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
