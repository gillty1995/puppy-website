"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PuppyWaitlistCta() {
  return (
    <section
      id="waitlist"
      className="relative overflow-hidden bg-stone-100 px-6 py-24 md:px-20"
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute left-[8%] top-[18%] h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl"
          animate={{ y: [0, 16, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[12%] top-[22%] h-56 w-56 rounded-full bg-stone-300/30 blur-3xl"
          animate={{ y: [0, -18, 0], x: [0, -12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.p
          className="text-sm uppercase tracking-[0.35em] text-emerald-700"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          Puppies Sold Out
        </motion.p>
        <motion.h2
          className="mt-5 text-4xl font-extrabold text-gray-900 md:text-6xl"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, delay: 0.05 }}
        >
          No puppies currently available for adoption.
        </motion.h2>
        <motion.p
          className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-gray-700"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7, delay: 0.12 }}
        >
          Check our blog for more updates or sign up to our waitlist below.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, delay: 0.18 }}
        >
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-7 py-3 rounded-full shadow-lg hover:bg-emerald-500 hover:scale-110 transition text-xl font-medium"
          >
            Join Our Waitlist
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 bg-white/70 px-7 py-3 text-lg font-medium text-gray-900 transition hover:bg-white"
          >
            Visit Blog
          </Link>
        </motion.div>

        <motion.p
          className="mx-auto mt-5 max-w-xl text-center text-sm leading-7 text-gray-500"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, delay: 0.24 }}
        >
          Waitlist deposit: $500. It is non-refundable for 18 months and will be
          applied toward the final puppy purchase price.
        </motion.p>
      </div>
    </section>
  );
}
