"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import {
  WAITLIST_DEPOSIT_AMOUNT,
  WAITLIST_REFUND_ELIGIBILITY_MONTHS,
} from "@/lib/waitlistConfig";

export default function WaitlistPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/waitlist/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, notes }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "Unable to start waitlist checkout.");
      }

      window.location.href = payload.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start checkout.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 px-6 py-16 md:px-20">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/#puppies"
          className="mb-8 inline-flex text-sm font-medium text-gray-700 hover:underline"
        >
          &larr; Back to Puppies
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <section className="relative overflow-hidden py-6 lg:py-10">
            <motion.div
              className="absolute left-[-4rem] top-[3rem] h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl"
              animate={{ y: [0, 16, 0], x: [0, 8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-[10%] top-[8rem] h-56 w-56 rounded-full bg-stone-300/30 blur-3xl"
              animate={{ y: [0, -18, 0], x: [0, -10, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative max-w-2xl">
              <motion.p
                className="text-sm uppercase tracking-[0.35em] text-emerald-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Waitlist
              </motion.p>
              <motion.h1
                className="mt-4 text-4xl font-extrabold leading-[0.95] tracking-tight text-gray-900 md:text-6xl lg:text-7xl"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
              >
                Reserve your spot for the next litter.
              </motion.h1>
              <motion.p
                className="mt-6 max-w-xl text-lg leading-8 text-gray-700"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.12 }}
              >
                Join the waitlist with a $500 deposit. If a puppy is available
                within 18 months, the deposit stays on file toward the final
                puppy price. If not, the deposit becomes eligible for refund
                after the 18 month window.
              </motion.p>

              <motion.div
                className="mt-10 flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18 }}
              >
                <div className="rounded-full border border-stone-200 bg-white/75 px-5 py-3 text-sm text-gray-700 backdrop-blur">
                  Deposit: <span className="font-semibold">${WAITLIST_DEPOSIT_AMOUNT}</span>
                </div>
                <div className="rounded-full border border-stone-200 bg-white/75 px-5 py-3 text-sm text-gray-700 backdrop-blur">
                  Refund rule:{" "}
                  <span className="font-semibold">
                    {WAITLIST_REFUND_ELIGIBILITY_MONTHS} months
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="mt-12 grid max-w-xl gap-4 sm:grid-cols-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
              >
                <div className="rounded-3xl border border-stone-200 bg-white/65 px-5 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                    Available soon
                  </p>
                  <p className="mt-2 text-sm leading-7 text-gray-700">
                    If you miss the current litter, we’ll keep you first in line
                    for the next one.
                  </p>
                </div>
                <div className="rounded-3xl border border-stone-200 bg-white/65 px-5 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                    Tailored updates
                  </p>
                  <p className="mt-2 text-sm leading-7 text-gray-700">
                    Use the notes field to tell us what kind of puppy you’re
                    hoping for.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>

          <motion.aside
            className="rounded-[2.5rem] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-12"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Phone
                </span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">
                  Notes
                </span>
                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us what kind of puppy you’re hoping for..."
                  className="w-full rounded-3xl border border-stone-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#86efac" : "#059669",
                  borderColor: loading ? "#bbf7d0" : "#065f46",
                }}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-emerald-800 bg-emerald-600 px-7 py-3 text-xl font-medium text-white shadow-lg transition hover:scale-110 hover:bg-emerald-500 appearance-none disabled:cursor-not-allowed disabled:border-emerald-200 disabled:bg-emerald-300 disabled:scale-100"
              >
                {loading
                  ? "Redirecting to secure checkout..."
                  : "Reserve Waitlist Spot"}
              </button>
            </form>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <p className="mt-6 text-sm leading-7 text-gray-600">
              Stripe will handle the secure payment step. We’ll keep your
              deposit on file and notify our team immediately when your spot is
              confirmed.
            </p>
          </motion.aside>
        </div>
      </div>
    </main>
  );
}
