"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function PuppyWaitlistCta() {
  return (
    <section className="px-6 md:px-20 py-20 bg-stone-100">
      <div className="mx-auto max-w-5xl">
        <motion.div
          className="relative overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white px-6 py-14 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:px-12"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-stone-50" />
          <div className="relative z-10 grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
                Puppies Sold Out
              </p>
              <h2 className="mt-4 max-w-2xl text-4xl font-extrabold text-gray-900 md:text-6xl">
                No puppies currently available for adoption.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-700">
                Check our blog for more updates or sign up to our waitlist
                below.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/waitlist"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-7 py-3 text-lg font-medium text-white transition hover:bg-emerald-500"
                >
                  Join Our Waitlist
                </Link>
                <Link
                  href="/blog"
                  className="inline-flex items-center justify-center rounded-full border border-stone-300 px-7 py-3 text-lg font-medium text-gray-900 transition hover:bg-white"
                >
                  Visit Blog
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-emerald-100 bg-stone-50 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">
                Waitlist Deposit
              </p>
              <p className="mt-3 text-4xl font-bold text-gray-900">$500</p>
              <p className="mt-3 text-sm leading-7 text-gray-700">
                Hold your spot for an upcoming litter. The deposit is
                non-refundable for 18 months and can become eligible for refund
                if no puppy is available in that window.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
