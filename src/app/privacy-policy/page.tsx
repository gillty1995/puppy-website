import Link from "next/link";

const updatedOn = "April 13, 2026";

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-sm text-gray-600">Last updated: {updatedOn}</p>
        </div>

        <p>
          Textile Poms respects your privacy. This Privacy Policy explains what
          information we collect through our website, how we use it, when we
          share it, and the choices you have regarding your information. By
          using this website, submitting an inquiry, leaving a blog comment, or
          making a reservation payment, you agree to the practices described in
          this Privacy Policy.
        </p>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            1. Information We Collect
          </h2>
          <div className="space-y-3">
            <p>We may collect the following categories of information:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Contact information you provide, such as your name, email
                address, phone number, and any message you send through our
                contact form or other website forms.
              </li>
              <li>
                Reservation and adoption information, including the puppy you
                inquire about or reserve, notes related to your inquiry, and
                basic customer communication records.
              </li>
              <li>
                Blog comment information, including the email address submitted
                with a comment, the comment text, and the date and time of the
                submission.
              </li>
              <li>
                Payment and transaction information related to deposits or final
                invoices, such as the puppy reserved, payment amount, payment
                status, invoice status, customer name, customer email address,
                and Stripe transaction identifiers.
              </li>
              <li>
                Technical information automatically collected by our website and
                service providers, such as IP address, browser type, device
                information, referring pages, and general usage data.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Respond to inquiries and provide customer support.</li>
            <li>
              Communicate about available puppies, reservations, adoption
              timing, pickup or delivery logistics, and follow-up questions.
            </li>
            <li>
              Process reservation deposits and final balance invoices through
              Stripe.
            </li>
            <li>
              Maintain business records related to reservations, payments,
              invoices, and customer communications.
            </li>
            <li>
              Display blog comments publicly in masked form while retaining
              private internal records needed to moderate comments and respond to
              commenters when appropriate.
            </li>
            <li>
              Improve site functionality, security, fraud prevention, and
              website administration.
            </li>
            <li>
              Comply with legal, accounting, tax, and recordkeeping
              obligations.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            3. Payments and Stripe
          </h2>
          <div className="space-y-3">
            <p>
              Reservation deposits and certain payment-related transactions on
              this website are processed through Stripe. When you submit payment
              information through a Stripe-hosted checkout or invoice page, your
              payment information is processed by Stripe in accordance with
              Stripe&apos;s terms and privacy practices.
            </p>
            <p>
              We generally do not store full payment card numbers on our own
              servers. However, we may receive and store limited transaction and
              customer information from Stripe, including your name, email
              address, payment status, deposit amount, invoice status, and
              Stripe transaction or customer IDs, so we can manage reservations,
              payments, and final invoices.
            </p>
            <p>
              Stripe&apos;s privacy policy is available at{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                stripe.com/privacy
              </a>
              .
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            4. Blog Comments and Outreach
          </h2>
          <div className="space-y-3">
            <p>
              If you leave a comment on a blog post, your comment may be
              displayed publicly. We mask comment email addresses on the public
              website so the full address is not displayed to site visitors.
            </p>
            <p>
              We may retain a private internal record of commenter contact
              information for moderation, customer service, fraud prevention, or
              follow-up related to available puppies, waitlists, updates, or
              offers, where permitted by applicable law.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            5. When We Share Information
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              With service providers that help us operate the website or process
              payments, such as hosting, website infrastructure, and Stripe.
            </li>
            <li>
              With professional advisors or service providers assisting with
              bookkeeping, legal compliance, fraud prevention, or technical
              support.
            </li>
            <li>
              If required by law, court order, subpoena, or to protect our
              rights, customers, animals, or business operations.
            </li>
            <li>
              In connection with a sale, transfer, or restructuring of the
              business, subject to appropriate confidentiality protections.
            </li>
          </ul>
          <p className="mt-3">
            We do not sell your personal information for money.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">6. Data Retention</h2>
          <p>
            We retain personal information for as long as reasonably necessary
            to operate our business, complete reservations or adoptions, respond
            to inquiries, maintain payment and business records, resolve
            disputes, enforce our agreements, and comply with applicable law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">7. Security</h2>
          <p>
            We use reasonable administrative, technical, and organizational
            measures to protect personal information. However, no method of
            transmission over the internet or method of electronic storage is
            completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">8. Your Choices</h2>
          <div className="space-y-3">
            <p>
              You may contact us to request access to, correction of, or
              deletion of personal information we hold about you, subject to
              applicable legal and recordkeeping obligations.
            </p>
            <p>
              To make a privacy-related request, please use our{" "}
              <Link href="/#contact" className="underline">
                Contact Form
              </Link>
              .
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            9. Children&apos;s Privacy
          </h2>
          <p>
            This website is not intended for children under 18, and we do not
            knowingly collect personal information directly from children
            through this website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">
            10. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our business, services, website features, payment
            practices, or applicable law. The updated version will be posted on
            this page with a revised effective date.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-2">11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our privacy
            practices, please contact us through our{" "}
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
