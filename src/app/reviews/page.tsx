"use client";

import { Suspense } from "react";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SubmitReviewPage() {
  const [name, setName] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const searchParams = useSearchParams();
  const adoptionId = searchParams.get("adoptionId");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/adoptions/review", {
      method: "POST",
      body: JSON.stringify({ adoptionId, name, review, rating }),
      headers: { "Content-Type": "application/json" },
    });
    setSubmitted(true);
  }

  return (
    <section className="min-h-screen flex items-center justify-center bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-xl w-full">
        <Link
          href="/adoptions"
          className="text-blue-600 hover:underline block mb-8"
        >
          &larr; Back to Adoptions
        </Link>
        <h1 className="text-3xl font-serif text-gray-900 mb-8 text-center">
          Submit Your Adoption Review
        </h1>
        <div className="bg-white p-8 rounded-lg shadow">
          {submitted ? (
            <p className="text-green-600 text-lg text-center">
              Thank you for your review! It will be published once approved.
            </p>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-emerald-500 text-black"
              />
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Your Review"
                rows={4}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-emerald-500 text-black"
              />
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-800">Rating:</span>
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    className={`text-2xl transition-colors ${
                      rating >= num ? "text-yellow-400" : "text-gray-300"
                    } cursor-pointer`}
                    onClick={() => setRating(num)}
                    aria-label={`Rate ${num} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="w-full text-white py-4 rounded-full cursor-pointer font-medium text-xl transition-colors duration-200 ease-in-out !bg-emerald-600 hover:!bg-emerald-500"
              >
                Submit Review
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <Suspense>
      <SubmitReviewPage />
    </Suspense>
  );
}
