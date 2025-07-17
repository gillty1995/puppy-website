"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Review {
  name: string;
  review: string;
  rating: number;
  createdAt: string;
}

export default function AdminAdoptionReviewsPage() {
  const [pending, setPending] = useState<Review[]>([]);

  useEffect(() => {
    fetch("/api/adoptions/review")
      .then((res) => res.json())
      .then(setPending);
  }, []);

  async function acceptReview(index: number) {
    await fetch("/api/adoptions/review/accept", {
      method: "POST",
      body: JSON.stringify({ index }),
      headers: { "Content-Type": "application/json" },
    });
    setPending(pending.filter((_, i) => i !== index));
  }

  return (
    <section className="py-16 px-6 md:px-20">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <Link href="/" className="text-blue-600 hover:underline block mb-8">
          &larr; Back to Home
        </Link>
        <h1 className="text-3xl text-gray-900 text-center font-serif mb-6">
          Pending Adoption Reviews
        </h1>
        {pending.length === 0 ? (
          <p className="text-gray-600">No pending reviews.</p>
        ) : (
          <ul className="space-y-6">
            {pending.map((r, i) => (
              <li key={i} className="border-b pb-4">
                <div className="font-bold text-gray-700">{r.name}</div>
                <div className="text-yellow-400 text-xl">
                  {"★".repeat(r.rating)}
                  {"☆".repeat(5 - r.rating)}
                </div>
                <div className="italic text-gray-700">{r.review}</div>
                <button
                  className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded cursor-pointer hover:bg-emerald-500"
                  onClick={() => acceptReview(i)}
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
