import { readPosts, Post } from "@/data/posts";
import CommentsSection from "@/components/CommentSection";
import Link from "next/link";

interface Params {
  params: { id: string };
}

export default async function PostPage({ params }: Params) {
  // 1) Load all posts from your JSON store
  const posts = await readPosts();
  const post = posts.find((p) => p.id === params.id);

  // 2) If not found, render a message
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

  // 3) Render the post
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
          {post.images.map((src) => (
            <img
              key={src}
              src={src}
              alt={post.title}
              className="w-full object-cover rounded-lg"
            />
          ))}

          <p className="text-gray-700 whitespace-pre-line">{post.body}</p>
        </div>

        {/* Comments and form */}
        <CommentsSection postId={post.id} />
      </div>
    </section>
  );
}
