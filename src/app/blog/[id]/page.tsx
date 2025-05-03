import { readPosts } from "@/data/posts";
import Link from "next/link";
import StaticImg from "@/components/StaticImg";
import CommentsWrapper from "@/components/CommentsWrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  // 1) Unwrap the dynamic segment
  const { id } = await params;

  // 2) Load all posts and find the one matching
  const posts = await readPosts();
  const post = posts.find((p) => p.id === id);

  // 3) If not found, render a message
  if (!post) {
    return (
      <section id="blog-post" className="py-16 bg-gray-50 px-6 md:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-gray-600">Sorry, that post wasn’t found.</p>
          <Link
            href="/blog"
            className="text-emerald-600 hover:underline mt-4 block"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </section>
    );
  }

  // 4) Render the post
  return (
    <section id="blog-post" className="py-16 bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-4xl">
        <Link href="/blog" className="text-blue-600 hover:underline">
          &larr; Back to Blog
        </Link>

        <h1 className="text-4xl font-serif text-gray-900 mt-6 mb-8 text-center">
          {post.title}
        </h1>

        <div className="space-y-6">
          {post.images.map((src) => {
            const filename = src.replace(/^\/uploads\//, "");
            return (
              <StaticImg
                key={src}
                src={`/api/uploads/${filename}`}
                alt={post.title}
                width={400}
                height={580}
                className="w-full object-cover rounded-lg"
              />
            );
          })}

          <p className="text-gray-700 whitespace-pre-line">{post.body}</p>
        </div>

        {/* client-only comments */}
        <CommentsWrapper postId={post.id} />
      </div>
    </section>
  );
}
