"use client";
import Link from "next/link";

export default function CareSection() {
  return (
    <section
      id="care"
      className="py-16 bg-gray-50 px-6 md:px-20 flex flex-col md:flex-row items-center justify-between"
    >
      {/* Text block */}
      <p className="max-w-xl text-4xl md:text-5xl font-serif text-gray-900 leading-tight">
        Love begins here. Bonds grow daily. Forever starts today.
      </p>

      {/* Learn More button */}
      <div className="mt-8 md:mt-0">
        <Link href="/care">
          <button className="cursor-pointer px-6 py-2 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 delay-100 ease-in-out transition text-xl">
            Learn More
          </button>
        </Link>
      </div>
    </section>
  );
}
