import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 md:px-20 py-16 text-black">
      <Link
        href="/#contact"
        className="text-blue-600 hover:underline block mb-8"
      >
        &larr; Back to Contact
      </Link>
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        By using Textile Poms, you agree to these terms. Please read them
        carefully.
      </p>
      <h2 className="text-2xl font-semibold mb-2">1. Acceptance</h2>
      <p className="mb-4">
        You must be at least 18 years old to place an adoption inquiry on this
        site.
      </p>
      <h2 className="text-2xl font-semibold mb-2">2. Use of Content</h2>
      <p className="mb-4">
        All images and text on this site are owned by Textile Poms and may not
        be used without permission.
      </p>
      <h2 className="text-2xl font-semibold mb-2">3. Liability</h2>
      <p>
        We are not responsible for any damages arising from the use of
        information on this site.
      </p>
    </main>
  );
}
