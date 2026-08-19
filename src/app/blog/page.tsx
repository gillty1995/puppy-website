import Link from "next/link";
import StaticImg from "@/components/StaticImg";
import { readPosts } from "@/data/posts";
import { getBlogImages, resolveBlogImageSrc, sortBlogPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPage() {
  const posts = sortBlogPosts(
    (await readPosts()).filter((post) => post.status === "published")
  );
  const featuredPost = posts.find((post) => post.featured) || posts[0];
  const secondaryPosts = posts.filter((post) => post.id !== featuredPost?.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffaf0,_#f8f5ef_45%,_#f1ede6_100%)] px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <Link href="/#home" className="text-black hover:underline block mb-8">
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-serif text-gray-900 mb-8 text-center">
          Stories, Photos, and Updates
        </h1>

        <section className="mt-8 overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6 p-8 sm:p-10 lg:p-14">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
                  Puppy Blog
                </p>
                <h1 className="mt-4 max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Follow the litters as they grow, play, and find their forever homes.
                </h1>
                <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600">
                  This is where we share new arrivals, reservation updates,
                  puppy milestones, and the little moments that make each litter
                  special. Come back anytime for fresh photos and stories from
                  home.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                    Posts
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {posts.length}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                    Featured
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {posts.filter((post) => post.featured).length}
                  </p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-stone-500">
                    Latest
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    {featuredPost?.publishedAt
                      ? new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(
                          new Date(featuredPost.publishedAt || featuredPost.id)
                        )
                      : "Just now"}
                  </p>
                </div>
              </div>
            </div>

            {featuredPost ? (
              <Link
                href={`/blog/${featuredPost.id}`}
                className="group relative block min-h-[22rem] overflow-hidden bg-stone-100 lg:min-h-full"
              >
                <StaticImg
                  src={resolveBlogImageSrc(
                    featuredPost.coverImage || getBlogImages(featuredPost)[0]
                  )}
                  alt={featuredPost.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                  <div className="flex flex-wrap gap-2">
                    {featuredPost.featured ? (
                      <span className="rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-950">
                        Featured
                      </span>
                    ) : null}
                    {(featuredPost.tags ?? []).slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/85">
                    {featuredPost.excerpt}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="flex min-h-[22rem] items-center justify-center bg-stone-100 p-8 text-center text-stone-500">
                No published posts yet.
              </div>
            )}
          </div>
        </section>

        {secondaryPosts.length > 0 ? (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
                  Latest stories
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  More from the blog
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {secondaryPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.id}`}
                  className="group overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
                    <StaticImg
                      src={resolveBlogImageSrc(
                        post.coverImage || getBlogImages(post)[0]
                      )}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap gap-2">
                      {post.featured ? (
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                          Featured
                        </span>
                      ) : null}
                      {(post.tags ?? []).slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {post.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-4 text-xs uppercase tracking-[0.25em] text-stone-500">
                      <span>
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(post.publishedAt || post.id))}
                      </span>
                      <span>{post.images.length} photos</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
