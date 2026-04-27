import Link from "next/link";
import StaticImg from "@/components/StaticImg";
import { getPreviousLitters } from "@/data/previousLitters";
import { resolvePuppyImageSrc } from "@/lib/puppyImageSrc";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PreviousLittersPage() {
  const groups = await getPreviousLitters();

  return (
    <section
      id="previous-litters"
      className="min-h-screen py-16 bg-gray-50 px-6 md:px-20"
    >
      <div className="mx-auto max-w-6xl">
        <Link href="/#home" className="text-black hover:underline block mb-8">
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-serif text-gray-900 mb-8 text-center max-sm:mt-10">
          Previous Litters
        </h1>

        <p className="text-gray-700 mb-8">
          Below are our past litters. Click one to view that litter&apos;s
          gallery and info.
        </p>

        {groups.length ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {groups.map((litter) => (
              <Link
                key={litter.slug}
                href={`/previous-litters/${litter.slug}`}
                aria-label={`View ${litter.title}`}
                className="group block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                <div className="aspect-square w-full bg-zinc-100">
                  <StaticImg
                    src={resolvePuppyImageSrc(litter.thumb)}
                    alt={litter.title}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {litter.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-10 text-gray-600 shadow-sm">
            No archived litters yet.
          </div>
        )}
      </div>
    </section>
  );
}
