"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StaticImg from "@/components/StaticImg";

interface Review {
  adoptionId: string;
  name: string;
  review: string;
  createdAt?: string;
  rating?: number;
}

interface Adoption {
  id: string;
  details: string;
  photo: string;
  reviews: Review[];
}

export default function AdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);

  useEffect(() => {
    fetch("/api/adoptions")
      .then((res) => res.json())
      .then(setAdoptions);
  }, []);

  return (
    <section
      id="adoptions"
      className="min-h-screen py-16 bg-gray-50 px-6 md:px-20"
    >
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#home"
          className="text-black hover:underline block mb-8"
        >
          &larr; Back to Home
        </Link>
        <h1 className="text-4xl font-serif text-gray-900 mb-8 text-center">
          Adoptions
        </h1>
        <div className="grid gap-8">
          {adoptions.map((a) => {
            const review =
              a.reviews && a.reviews.length > 0 ? a.reviews[0] : null;
            return (
              <div
                key={a.id}
                className="
        bg-white rounded-lg shadow p-6 flex flex-col lg:flex-row
        items-center lg:items-start hover:shadow-lg transition
        max-[1025px]:items-center max-[1025px]:justify-center
      "
              >
                {/* Image and details - always centered on mobile/tablet */}
                <div className="lg:w-2/3 w-full flex flex-col items-center max-[1025px]:items-center max-[1025px]:justify-center">
                  <StaticImg
                    src={a.photo}
                    alt={a.details}
                    width={400}
                    height={800}
                    className="w-full h-140 object-cover rounded mb-4"
                  />
                  <h2 className="text-center text-lg text-gray-700 mb-2">
                    {a.details}
                  </h2>
                  {/* On mobile/tablet (≤1025px), show review/button below image and caption */}
                  <div className="w-full max-[1025px]:flex max-[1025px]:flex-col max-[1025px]:items-center max-[1025px]:justify-center hidden">
                    {review ? (
                      <div className="text-gray-700 italic text-center mt-2">
                        &quot;{review.review}&quot;
                        <br />
                        <span className="font-bold">- {review.name}</span>
                        <div className="text-yellow-400 text-lg mt-2">
                          {"★".repeat(review.rating ?? 0)}
                          {"☆".repeat(5 - (review.rating ?? 0))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/reviews?adoptionId=${a.id}`}
                        className="block w-full mt-4 px-8 py-4 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition text-xl text-center"
                      >
                        Submit Review
                      </Link>
                    )}
                  </div>
                </div>
                {/* On desktop (>1025px), show review/button to the right */}
                <div className="lg:w-1/3 w-full max-[1025px]:hidden flex items-center justify-center h-full mt-4 lg:mt-0">
                  {review ? (
                    <div className="text-gray-700 italic text-center">
                      &quot;{review.review}&quot;
                      <br />
                      <span className="font-bold">- {review.name}</span>
                      <div className="text-yellow-400 text-lg mt-2">
                        {"★".repeat(review.rating ?? 0)}
                        {"☆".repeat(5 - (review.rating ?? 0))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={`/reviews?adoptionId=${a.id}`}
                      className="px-8 py-4 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition text-xl"
                    >
                      Submit Review
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
