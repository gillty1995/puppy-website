"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

export default function Litters() {
  return (
    <section className="relative w-full h-[420px] sm:h-[520px] md:h-[600px] overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover object-top"
        src="/videos/cash-video.MOV"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />

      <div className="absolute inset-0 bg-zinc-900/55" />

      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.9 }}
          >
            <h2 className="text-4xl md:text-7xl font-serif leading-tight text-white mb-4">
              Previous Litters
            </h2>
            <p className="text-zinc-200 mb-6 max-w-2xl mx-auto">
              See photos and information from our past litters — click through
              to view each litter's gallery and details.
            </p>

            <Link
              href="/previous-litters"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-7 py-3 rounded-full shadow-lg hover:bg-emerald-500 hover:scale-110 transition text-xl font-medium"
            >
              View Previous Litters
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
