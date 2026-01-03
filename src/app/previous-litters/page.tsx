import React from "react";
import Link from "next/link";
import StaticImg from "@/components/StaticImg";

const LITTERS = [
  {
    slug: "litter-2025",
    title: "Litter — 2025",
    thumb: "/images/litter-2025.jpeg",
  },
];

export default function PreviousLittersPage() {
  return (
    <section
      id="previous-litters"
      className="min-h-screen py-16 bg-gray-50 px-6 md:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/#home"
          className="text-blue-600 hover:underline block mb-8"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-serif text-gray-900 mb-8 text-center max-sm:mt-10">
          Previous Litters
        </h1>

        <p className="text-gray-700 mb-8">
          Below are our past litters. Click one to view that litter's gallery
          and info.
        </p>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {LITTERS.map((litter, idx) => (
            <Link
              key={litter.slug}
              href={`/previous-litters/${litter.slug}`}
              aria-label={`View ${litter.title}`}
              className="group block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
            >
              <div className="aspect-square w-full bg-zinc-100">
                <StaticImg
                  src={litter.thumb}
                  alt={litter.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>

              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  {litter.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
