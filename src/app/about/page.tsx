// app/about/page.tsx
import Link from "next/link";

export default function AboutPage() {
  return (
    <section id="about" className="py-16 bg-gray-50 px-6 md:px-20">
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
          About Our Family
        </h1>

        {/* Top divider */}
        <div className="border-t border-gray-300 mb-8" />

        {/* Content */}
        <div className="space-y-6 text-gray-700">
          <p>
            Cashmere, our beloved dame, joined our family three years ago —
            marking the start of this wonderful journey. A year later, Corduroy,
            our affectionate sire, became part of our home after spending his
            first eight weeks in Tennessee with his purebred orange Pomeranian
            parents.
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
            five-year-old son, gentle with our cats, and welcoming to every
            foster animal who passes through our home. Their loving spirits have
            shaped our commitment to raising well-adjusted, happy puppies.
          </p>

          <hr className="border-t border-gray-200 my-6" />

          <p>
            As a Fear Free–certified shelter employee, I’m confident in our
            family’s ability to provide top-tier care: from socialization and
            training to health screenings and enrichment. We look forward to
            sharing these wonderful dogs with your family — bringing joy,
            companionship, and a lifetime of memories.
          </p>
        </div>
        <div className="border-t border-gray-300 mt-8" />

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-3xl text-gray-800 mb-4 font-serif">
            Check out our blog for additional pictures, stories, and more!
          </p>
          <Link href="/blog">
            <button className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition">
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
