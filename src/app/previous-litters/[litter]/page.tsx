import Link from "next/link";
import StaticImg from "@/components/StaticImg";
import { getPreviousLitter } from "@/data/previousLitters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LitterPage({
  params,
}: {
  params: Promise<{ litter: string }>;
}) {
  const { litter } = await params;
  const litterData = await getPreviousLitter(litter);

  return (
    <section
      id="litter"
      className="py-16 bg-gray-50 px-6 md:px-20 min-h-screen"
    >
      <div className="mx-auto max-w-6xl">
        <Link
          href="/previous-litters"
          className="text-black hover:underline block mb-8"
        >
          &larr; Back to Previous Litters
        </Link>

        <h1 className="text-4xl font-serif text-gray-900 mb-8 text-center max-sm:mt-10">
          {litterData?.summary.title || litter.replace(/-/g, " ")} Gallery
        </h1>

        <p className="text-gray-700 mb-8">
          Click a puppy to view that puppy&apos;s gallery and related blog
          posts.
        </p>

        {litterData?.puppies?.length ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {litterData.puppies.map((p) => (
              <Link
                key={`${litter}-${p.slug}`}
                href={`/previous-litters/${litter}/${p.slug}`}
                className="group block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition"
              >
                <div className="aspect-square w-full bg-zinc-100">
                  <StaticImg
                    src={p.image}
                    alt={p.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {p.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-stone-200 bg-white px-6 py-10 text-gray-600 shadow-sm">
            This litter has no archived puppies yet.
          </div>
        )}
      </div>
    </section>
  );
}
