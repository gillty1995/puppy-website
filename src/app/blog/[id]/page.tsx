import Link from "next/link";
import CommentsWrapper from "@/components/CommentsWrapper";
import BlogGallery from "@/components/BlogGallery";
import { readPosts } from "@/data/posts";
import { sortBlogPosts } from "@/lib/blog";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const post = sortBlogPosts(
    (await readPosts()).filter(
      (entry) => entry.status === "published" && entry.id === id
    )
  )[0];

  if (!post) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf0,_#f8f5ef_45%,_#f1ede6_100%)] px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl rounded-[2.5rem] border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
            Blog post not found
          </p>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Sorry, that post wasn’t found.
          </h1>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500"
          >
            Back to Blog
          </Link>
        </div>
      </main>
    );
  }

  const publishedAt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(post.publishedAt || post.id));

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf0,_#f8f5ef_45%,_#f1ede6_100%)] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <Link href="/blog" className="text-black hover:underline block mb-8">
          &larr; Back to Blog
        </Link>

        <div className="mb-8 flex flex-wrap gap-2">
          {post.featured ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
              Featured
            </span>
          ) : null}
          {(post.tags ?? []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium text-stone-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <article className="mt-8 overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="min-w-0 p-8 sm:p-10 lg:p-14">
              <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
                {publishedAt}
              </p>
              <h1 className="mt-4 max-w-3xl break-words text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {post.title}
              </h1>

              <div className="mt-8 min-w-0 rounded-[2rem] border border-stone-200 bg-stone-50 p-5 sm:p-6">
                <p className="whitespace-pre-wrap break-words text-base leading-8 text-stone-700">
                  {post.body}
                </p>
              </div>
            </div>

            <div className="min-w-0 border-t border-stone-200 bg-stone-50 p-5 sm:p-6 lg:border-l lg:border-t-0">
              <BlogGallery images={post.images} title={post.title} />
            </div>
          </div>
        </article>

        <section className="mt-10 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
          <CommentsWrapper postId={post.id} />
        </section>
      </div>
    </main>
  );
}
