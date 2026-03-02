import { readPosts } from "@/data/posts";
import Link from "next/link";
import CommentsWrapper from "@/components/CommentsWrapper";
import Lightbox from "@/components/Lightbox";
import PostImages from "@/components/PostImages";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;

  const posts = await readPosts();
  const post = posts.find((p) => p.id === id);

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

  return (
    <section id="blog-post" className="py-16 bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-4xl">
        <Link href="/blog" className="text-black hover:underline">
          &larr; Back to Blog
        </Link>

        <h1 className="text-4xl font-serif text-gray-900 mt-6 mb-8 text-center">
          {post.title}
        </h1>

        <div className="space-y-6">
          <PostImages images={post.images} />

          <p className="text-gray-700 whitespace-pre-line">{post.body}</p>
        </div>

        {/* client-only comments */}
        <CommentsWrapper postId={post.id} />
      </div>

      <Lightbox />
    </section>
  );
}
