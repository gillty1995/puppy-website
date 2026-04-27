import Link from "next/link";

export default function WaitlistCancelPage() {
  return (
    <main className="min-h-screen bg-stone-100 px-6 py-20 md:px-20">
      <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-stone-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-12">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
          Checkout Canceled
        </p>
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900 md:text-6xl">
          Your waitlist spot is still open.
        </h1>
        <p className="mt-5 text-lg leading-8 text-gray-700">
          If you’d like to complete your deposit, you can jump back in any time.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/waitlist"
            className="rounded-full bg-emerald-600 px-6 py-3 text-lg font-medium text-white transition hover:bg-emerald-500"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="rounded-full border border-stone-300 px-6 py-3 text-lg font-medium text-gray-900 transition hover:bg-stone-50"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
