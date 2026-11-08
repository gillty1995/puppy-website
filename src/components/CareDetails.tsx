"use client";

import Link from "next/link";
import Image from "next/image";

const veterinaryCarePhotos = [
  {
    src: "/images/metro-vet-team-with-puppies.webp",
    alt: "Metro Vet care team holding the puppies",
  },
  {
    src: "/images/metro-vet-puppy-care.webp",
    alt: "Metro Vet team members gently caring for a puppy",
  },
  {
    src: "/images/metro-vet-puppy-welcome.webp",
    alt: "Metro Vet team member holding a puppy at the front desk",
  },
];

export default function CareDetails() {
  return (
    <section id="care-details" className="py-16 bg-gray-50 px-0 lg:px-20">
      <div className="mx-auto max-w-4xl">
        {/* Back to Home */}
        <Link href="/#home" className="text-black hover:underline block mb-8">
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
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Grooming & Hygiene
            </h2>
            <p className="text-gray-700">
              Pomeranians have thick, double coats that require daily brushing —
              especially during shedding seasons. Baths are done every few weeks
              (or as needed) and nails are trimmed regularly. Ears are cleaned
              to prevent infections. In our home, Cashmere and Corduroy are
              groomed twice each week, including brushing and routine coat care.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Puppy Grooming & Sensory Exposure
            </h3>
            <p className="text-gray-700">
              At Textile Poms, our puppies are introduced to grooming from an
              early age through positive, gradual exposure. They receive daily
              brushing with a soft pin brush and metal comb, baths every two
              weeks, and structured grooming practice twice weekly.
            </p>
            <p className="mt-3 text-gray-700">
              We introduce professional grooming tools such as clippers,
              trimmers, shears, nail clippers, brushes, and combs, along with
              the sounds and vibrations of grooming equipment, bathing, and
              drying. We focus on positive experiences that build confidence and
              familiarity with lifelong coat maintenance, hygiene, and handling.
            </p>
            <p className="mt-3 text-gray-700">
              These at-home introductions are separate from formal grooming
              appointments. We recommend starting those at 12–16 weeks while
              keeping vaccinations current for the puppy’s age.
            </p>
          </div>

          {/* Nutrition */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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
              All of our puppies eat Retriever brand dry Puppy Blend. After
              adoption, keep them on this diet or gradually transition to a new
              food over 5–7 days — slowly mix in increasing amounts of the new
              food to help prevent tummy upset.
            </p>
          </div>

          {/* Exercise */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
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
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Training & Socialization
            </h2>
            <p className="text-gray-700">
              Our puppies build confidence through positive, gradual exposure to
              different textures, sounds, surfaces, and basic commands. They
              grow up amid the everyday bustle of family life and have
              age-appropriate opportunities to socialize with our children,
              other pets, adults, and people in public settings. For each
              puppy’s details, click their photo on the main page.
            </p>
          </div>

          {/* Veterinary Care */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Health & Veterinary Care
            </h2>
            <p className="text-gray-700">
              Preventative checkups catch issues early. We take all our dogs to
              Metro Vet near the Galleria in St. Louis for regular exams. Our
              puppies receive veterinary care while in our home and go home with
              a health certificate from their veterinarian. Adopters may request
              an additional full health examination before adoption at their
              expense. Our puppies are unregistered pet quality puppies.
            </p>
            <h3 className="mt-6 text-xl font-semibold text-gray-900">
              Meet Our Veterinary Care Team
            </h3>
            <p className="mt-2 text-gray-700">
              We appreciate the Metro Vet team’s extensive knowledge and
              dedication to our puppies’ well-being. They bring kindness and
              thoughtful care to every visit, treating each puppy like the
              precious little soul they are.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4">
              {veterinaryCarePhotos.map((photo) => (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  width={760}
                  height={760}
                  sizes="(max-width: 640px) 30vw, 240px"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              ))}
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Vaccinations
            </h3>
            <p className="text-gray-700">
              Before adoption, our puppies are up to date on age-appropriate
              vaccinations and are dewormed. They remain at home in a
              controlled, sanitary environment. After adoption, their families
              are responsible for subsequent age-appropriate vaccinations and
              veterinary care.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Spay & Neuter
            </h3>
            <p className="text-gray-700">
              Puppies will be expected to be spayed or neutered between 6 to 9
              months of age by their new owners.
            </p>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">
              Microchipping
            </h3>
            <p className="text-gray-700">
              Cashmere and Corduroy are both microchipped. We ask that you
              microchip your puppy with your contact info after adoption.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
