// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <section id="about" className="py-16 bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-4xl">
        {/* Back to Home */}
        <Link href="/#home" className="text-black hover:underline block mb-8">
          &larr; Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-4xl font-serif text-gray-900 mb-4 text-center">
          About Our Family
        </h1>

        {/* Top divider */}
        <div className="border-t border-gray-300 mb-8" />

        {/* Content */}
        <div className="space-y-6 text-gray-700">
          <p>
            Cashmere and Corduroy are the loving parents of our puppies and
            cherished members of our family. Their affectionate personalities,
            playful spirits, and gentle temperaments make them wonderful
            companions and bring so much joy to our home.
          </p>

          <hr className="border-t border-gray-200 my-6" />

          <p>
            As lifelong animal care enthusiasts and certified fosterers, we’ve
            opened our doors to many shelter animals. Cashmere and Corduroy have
            been caring mentors and playful companions to every unique animal
            we’ve welcomed, guiding them toward their forever homes.
          </p>

          <hr className="border-t border-gray-200 my-6" />

          <p>
            Witnessing Cashmere’s protective instincts and nurturing nature
            inspired us to responsibly breed our own Pomeranians. After
            veterinary approval, Cashmere and Corduroy began this path with us —
            bringing their intelligence, gentle temperament, and enthusiasm into
            each new generation.
          </p>

          <hr className="border-t border-gray-200 my-6" />

          <p>
            Beyond breeding, they’re fantastic family dogs: brilliant with our
            seven-year-old and one-year-old, gentle with our cats, and welcoming
            to every foster animal who passes through our home. Their loving
            spirits have shaped our commitment to raising well-adjusted, happy
            puppies.
          </p>

          <hr className="border-t border-gray-200 my-6" />

          <p>
            Blake the owner has over five years of experience working in humane
            society shelters and has completed Fear Free Certified Shelter
            training. Our family provides attentive care, enrichment, and
            training to help each puppy grow in confidence.
          </p>

          <p>
            Our puppies are unregistered pet quality puppies. They are up to
            date on age-appropriate vaccinations and are dewormed. They also
            receive positive, gradual sensory training with different textures,
            sounds, and surfaces while growing up amid the everyday bustle of
            family life. Time with our children, other pets, adults, and people
            in public settings helps them become comfortable around people and
            animals. We love watching each puppy’s personality blossom as they
            grow into confident, affectionate companions.
          </p>
        </div>
        <div className="border-t border-gray-300 mt-8" />

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-3xl text-gray-800 mb-4 font-serif">
            Check out our blog for additional pictures, stories, and more!
          </p>
          <Link href="/blog">
            <button className="px-6 py-3 bg-emerald-600 cursor-pointer text-white font-medium rounded-full hover:bg-emerald-500 transition">
              Visit Our Blog
            </button>
          </Link>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-gray-300 mt-8" />
      </div>
    </section>
  );
}
