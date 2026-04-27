import Link from "next/link";
import PuppyLightbox from "@/components/PuppyLightbox";
import { getPreviousLitter, getPreviousPuppy } from "@/data/previousLitters";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PuppyPage({
  params,
}: {
  params: Promise<{ litter: string; puppy: string }>;
}) {
  const { litter, puppy } = await params;
  const litterData = await getPreviousLitter(litter);
  const puppyData = await getPreviousPuppy(litter, puppy);

  if (!puppyData) {
    return (
      <section className="py-16 bg-gray-50 px-6 md:px-20 min-h-screen">
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/previous-litters/${litter}`}
            className="text-black hover:underline block mb-8"
          >
            &larr; Back to Puppies of {litterData?.summary.title || litter}
          </Link>
          <p className="text-gray-700">Puppy not found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50 px-6 md:px-20 min-h-screen">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/previous-litters/${litter}`}
          className="text-black hover:underline block mb-8"
        >
          &larr; Back to Puppies of {litterData?.summary.title || litter}
        </Link>

        <h1 className="text-6xl font-serif text-gray-900 mb-8 text-center">
          {puppyData.name}
        </h1>

        <PuppyLightbox images={puppyData.images} />

        <div className="mt-12">
          <h2 className="text-4xl font-serif text-gray-900 mb-4">
            Blog posts related to {puppyData.name}
          </h2>
          {puppyData.relatedPosts?.length ? (
            <ul className="list-disc pl-6">
              {puppyData.relatedPosts.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.id}`}
                    className="text-black hover:underline"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No related posts found.</p>
          )}
        </div>
      </div>
    </section>
  );
}
