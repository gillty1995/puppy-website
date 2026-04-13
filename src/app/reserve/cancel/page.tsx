import Link from "next/link";

export default function ReserveCancelPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-20 md:px-20">
      <div className="mx-auto max-w-2xl rounded-[2.5rem] border border-stone-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
          Checkout Canceled
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
          Your reservation wasn’t completed.
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          No problem. The puppy remains available unless another reservation has
          already been placed. You can return to the listing and try again when
          you’re ready.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/#puppies"
            className="rounded-full bg-emerald-600 px-6 py-3 text-white transition hover:bg-emerald-500"
          >
            Back to Puppies
          </Link>
          <Link
            href="/#contact"
            className="rounded-full border border-gray-300 px-6 py-3 text-gray-900 transition hover:border-gray-400 hover:bg-stone-50"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </main>
  );
}
