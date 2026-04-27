"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { WAITLIST_DEPOSIT_AMOUNT, WAITLIST_REFUND_ELIGIBILITY_MONTHS } from "@/lib/waitlistConfig";

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
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <motion.section
          className="rounded-[2.5rem] border border-stone-200 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-12"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Link href="/#puppies" className="text-sm font-medium text-gray-700 hover:underline">
            &larr; Back to Puppies
          </Link>

          <p className="mt-8 text-sm uppercase tracking-[0.35em] text-emerald-700">
            Waitlist
          </p>
          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold text-gray-900 md:text-6xl">
            Reserve your spot for the next litter.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-700">
            Join the waitlist with a $500 deposit. If a puppy is available
            within 18 months, the deposit stays on file toward the final puppy
            price. If not, the deposit becomes eligible for refund after the 18
            month window.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] bg-stone-50 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Deposit
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${WAITLIST_DEPOSIT_AMOUNT}
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-stone-50 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                Refund Rule
              </p>
              <p className="mt-2 text-lg font-semibold text-gray-900">
                {WAITLIST_REFUND_ELIGIBILITY_MONTHS} months
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">
              {error}
            </div>
          ) : null}
        </motion.section>

        <motion.aside
          className="rounded-[2.5rem] border border-emerald-100 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-12"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
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
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
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
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">
                Phone
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
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
                className="w-full rounded-3xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? "Redirecting to secure checkout..." : "Reserve Waitlist Spot"}
            </button>
          </form>

          <p className="mt-6 text-sm leading-7 text-gray-600">
            Stripe will handle the secure payment step. We’ll keep your deposit
            on file and notify our team immediately when your spot is confirmed.
          </p>
        </motion.aside>
      </div>
    </main>
  );
}
