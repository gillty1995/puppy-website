"use client";

import Link from "next/link";

export default function CareDetails() {
  return (
    <section id="care-details" className="py-16 bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-4xl">
        {/* Back to Home */}
        <Link
          href="/#home"
          className="text-blue-600 hover:underline block mb-8"
        >
          &larr; Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-4xl font-serif text-gray-900 mb-4 text-center">
          Pomeranian Care Plan
        </h1>

        {/* Intro */}
        <p className="text-gray-700 mb-12">
          Regular grooming, a balanced diet, ample exercise, consistent
          training, and proactive veterinary care are all important for keeping
          your Pomeranian happy and healthy. Below you’ll find both how we care
          for our adults and our recommended plan for puppies after adoption.
        </p>

        {/* Cards */}
        <div className="grid gap-8">
          {/* Grooming */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Grooming & Hygiene
            </h2>
            <p className="text-gray-700">
              Pomeranians have thick, double coats that require daily brushing —
              especially during shedding seasons. Baths are done every few weeks
              (or as needed) and nails are trimmed regularly. Ears are cleaned
              to prevent infections. In our home Cashmere and Corduroy receive
              top-of-the-line grooming; we also trust them to Groom All Pet
              Grooming Palace, LLC, a veterinarian-recommended salon.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Age-Appropriate Grooming
            </h3>
            <p className="text-gray-700">
              While puppies leave our care at eight weeks, we brush and bathe
              them as needed. We recommend starting formal grooming at 12–16
              weeks, once they’ve had their second vaccinations — this builds
              positive associations and helps them adapt to the process.
            </p>
          </div>

          {/* Nutrition */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nutrition & Feeding
            </h2>
            <p className="text-gray-700">
              Adult Pomeranians thrive on a high-quality, balanced diet rich in
              protein and nutrients. We feed ours a mix of cod fish, salmon,
              beef, chicken, rice, berries, pumpkin, and occasional Purina dry
              food, supplemented with non-sweetened Greek yogurt for probiotics.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Puppy Diet
            </h3>
            <p className="text-gray-700">
              All of our puppies eat Blue Buffalo - baby BLUE Healthy Growth
              Formula Puppy Wet Food. After adoption, keep them on this diet or
              gradually transition to a new food over 5–7 days — slowly mix
              increasing amounts of the new kibble to prevent tummy upset.
            </p>
          </div>

          {/* Exercise */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Exercise</h2>
            <p className="text-gray-700">
              Daily walks, playtime, and mental enrichment keep Pomeranians fit
              and happy. We use puzzle toys, games of fetch, hikes, and even
              swimming to engage Cashmere and Corduroy — and they love tagging
              along on family road trips!
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Age-Appropriate Exercise
            </h3>
            <p className="text-gray-700">
              Puppies need about 5 minutes of exercise per month of age (twice a
              day). For example, a 4-month-old puppy benefits from two 20-minute
              sessions. Always start slow — Pomeranians have delicate joints, so
              gradually build up to longer walks.
            </p>
          </div>

          {/* Training */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Training & Socialization
            </h2>
            <p className="text-gray-700">
              Consistency is key! We begin basic obedience — sit, stay, leash
              walking — and pair it with positive reinforcement and treats.
              Early socialization builds confidence; our puppies join Cashmere’s
              training sessions in a playful, age-appropriate way. For more on
              potty training and advanced skills, click your puppy’s photo on
              the main page.
            </p>
          </div>

          {/* Veterinary Care */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Health & Veterinary Care
            </h2>
            <p className="text-gray-700">
              Preventative checkups catch issues early. We take all our dogs to
              Rock Road Animal Hospital in St. Louis for regular exams.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Vaccinations
            </h3>
            <p className="text-gray-700">
              Puppies leave us with all age-appropriate shots complete, and
              their full vaccine record comes home with you.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Spay & Neuter
            </h3>
            <p className="text-gray-700">
              Puppy’s will be expected to be spayed or neutered between 6 to 9
              months of age by their new owners.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Microchipping
            </h3>
            <p className="text-gray-700">
              Cashmere and Corduroy are microchipped, and all puppies are
              chipped prior to adoption. Please update the chip with your
              contact info after adoption.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              AKC Registration
            </h3>
            <p className="text-gray-700">
              All of our dogs are AKC registered. Your puppy’s registration
              paperwork will be provided when you bring them home.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
