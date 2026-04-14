import Link from "next/link";

const updatedOn = "April 13, 2026";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 md:px-20 py-16 text-black">
      <Link
        href="/#contact"
        className="text-black hover:underline block mb-8"
      >
        &larr; Back to Contact
      </Link>

      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-sm text-gray-600">Last updated: {updatedOn}</p>
        </div>

        <p>
          These Terms of Service govern your use of the Textile Poms website.
          By accessing this website, submitting an inquiry, placing a
          reservation deposit, requesting an invoice, or otherwise using our
          services through the website, you agree to these Terms.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            1. Eligibility and Use of Website
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              You must be at least 18 years old to submit an adoption inquiry,
              place a reservation deposit, or enter into a transaction through
              this website.
            </li>
            <li>
              You agree to provide accurate and complete information when
              contacting us, submitting a comment, or making a payment.
            </li>
            <li>
              You may not use this website for unlawful, fraudulent, abusive, or
              misleading purposes.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            2. Puppy Listings and Availability
          </h2>
          <div className="space-y-3">
            <p>
              We make reasonable efforts to keep puppy listings, pricing,
              availability, and descriptions current. However, availability may
              change without notice, and a puppy shown on the site may become
              unavailable before a reservation is completed and confirmed.
            </p>
            <p>
              We reserve the right to correct pricing, listing, typographical,
              image, or description errors at any time, including after an
              inquiry has been submitted.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            3. Deposits, Reservations, and Payments
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              A reservation deposit is used to reserve a specific puppy and is
              applied toward the final adoption fee.
            </li>
            <li>
              Based on the current website and FAQ language, reservation
              deposits are non-refundable unless Textile Poms expressly agrees
              otherwise in writing.
            </li>
            <li>
              A puppy is not considered reserved until payment is successfully
              completed and confirmed.
            </li>
            <li>
              Remaining balances may be collected separately, including through
              a Stripe-hosted invoice.
            </li>
            <li>
              If a remaining balance or other required amount is not paid by the
              stated deadline, we may cancel the reservation and offer the puppy
              to another customer, subject to any separate written agreement.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">4. Stripe Payments</h2>
          <div className="space-y-3">
            <p>
              Payments initiated through this website are processed by Stripe or
              other designated third-party payment providers. By submitting a
              payment, you authorize the applicable payment provider to process
              the transaction.
            </p>
            <p>
              Textile Poms is not responsible for outages, processing delays,
              bank delays, card issuer decisions, fraud reviews, or other issues
              caused by third-party payment providers.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            5. Pickup, Delivery, and Timing
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              Pickup, delivery, and handoff arrangements must be coordinated
              directly with Textile Poms.
            </li>
            <li>
              Delivery fees, when applicable, are separate from the puppy price
              unless expressly stated otherwise.
            </li>
            <li>
              Timing estimates for adoption, pickup, transportation, or delivery
              are estimates only and may change for health, weather, travel, or
              scheduling reasons.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            6. Right to Refuse or Cancel
          </h2>
          <p>
            Textile Poms reserves the right to refuse service, decline a
            reservation, cancel a transaction, limit quantities, or decline to
            complete an adoption if we believe doing so is necessary for the
            wellbeing of the puppy, the safety of our business, compliance with
            law, suspected fraud, inaccurate information, or any other
            legitimate business reason.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            7. Website Content and Intellectual Property
          </h2>
          <p>
            All text, photographs, branding, graphics, and other content on this
            site are owned by or licensed to Textile Poms and may not be copied,
            reproduced, distributed, or used without prior written permission.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            8. Comments and User Submissions
          </h2>
          <p>
            If you submit comments, messages, or other materials through the
            website, you agree that they may be reviewed, moderated, removed, or
            displayed by Textile Poms. You must not submit unlawful, abusive,
            defamatory, deceptive, spammy, or infringing content.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            9. Disclaimer of Warranties
          </h2>
          <p>
            This website and its content are provided on an &quot;as is&quot; and
            &quot;as available&quot; basis without warranties of any kind, whether
            express or implied, including implied warranties of merchantability,
            fitness for a particular purpose, non-infringement, or uninterrupted
            availability.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            10. Limitation of Liability
          </h2>
          <p>
            To the fullest extent permitted by law, Textile Poms will not be
            liable for any indirect, incidental, consequential, special,
            exemplary, or punitive damages, or for any loss of profits, revenue,
            data, goodwill, or business opportunity arising out of or relating
            to your use of this website, your inability to use the site, or any
            payment or reservation transaction made through the site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">11. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Textile Poms from claims,
            losses, liabilities, damages, and expenses arising out of your
            misuse of the website, violation of these Terms, or violation of any
            law or rights of another person.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">12. Changes to Terms</h2>
          <p>
            We may revise these Terms from time to time. Updated Terms become
            effective when posted on this page unless otherwise stated.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">13. Contact</h2>
          <p>
            Questions about these Terms may be sent through our{" "}
            <Link href="/#contact" className="underline">
              Contact Form
            </Link>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
