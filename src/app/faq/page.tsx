import Link from "next/link";

export default function FAQPage() {
  return (
    <section id="faq" className="py-16 bg-gray-50 px-6 md:px-20">
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
          Frequently Asked Questions
        </h1>

        {/* Top divider */}
        <div className="border-t border-gray-300 mb-8" />

        {/* FAQ Content */}
        <div className="space-y-6 text-gray-700">
          <div>
            <h2 className="text-xl font-semibold">
              When will the puppies be old enough to be adopted?
            </h2>
            <p>
              Our Pomeranian puppies are typically ready for their forever homes
              at 8 weeks of age. By this time, they have received their first
              round of vaccinations, been dewormed, and gone through a thorough
              health check by our veterinarian.
            </p>
          </div>

          <hr className="border-t border-gray-200 my-6" />

          <div>
            <h2 className="text-xl font-semibold">
              Can I put a deposit down to reserve a puppy?
            </h2>
            <p>
              Yes — placing a $500 deposit will reserve your chosen puppy. This
              non-refundable deposit secures your puppy but is not applied
              toward the total adoption fee. If a puppy is on the website it is
              still available!
            </p>
          </div>

          <hr className="border-t border-gray-200 my-6" />

          <div>
            <h2 className="text-xl font-semibold">
              What is included in the adoption package?
            </h2>
            <p>
              Every puppy comes with up-to-date vaccinations, a microchip, a
              sample can of the food they&rsquo;re used to, and a puppy care
              guide. We also include their AKC paperwork.
            </p>
          </div>

          <hr className="border-t border-gray-200 my-6" />

          <div>
            <h2 className="text-xl font-semibold">
              How can I meet the puppies before adopting?
            </h2>
            <p>
              You&rsquo;re welcome to schedule an in-person visit. We conduct
              visits by appointment to ensure a calm, safe, one-on-one
              experience with each puppy.
            </p>
          </div>

          <hr className="border-t border-gray-200 my-6" />

          <div>
            <h2 className="text-xl font-semibold">
              What are the shipping or pickup options?
            </h2>
            <p>
              Local pickup is available in St. Louis, MO. If you’re out of
              state, just get in touch and we can work out a drop-off fee and
              deposit to have your puppy personally delivered.
            </p>
          </div>

          <hr className="border-t border-gray-200 my-6" />

          <div>
            <h2 className="text-xl font-semibold">
              How much do your Pomeranian puppies cost?
            </h2>
            <p>
              Our puppies range from $2,500 to $3,500 depending on coat color,
              markings, and sex. The reservation deposit of $500 is not applied
              to the final fee.
            </p>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-gray-300 mt-8" />

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-3xl text-gray-800 mb-4 font-serif">
            Ready to bring home a fluffy companion?
          </p>
          <Link href="/#contact">
            <button className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-full hover:bg-emerald-500 transition">
              Contact Us
            </button>
          </Link>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-gray-300 mt-8" />
      </div>
    </section>
  );
}
