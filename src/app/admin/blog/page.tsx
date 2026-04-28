"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StaticImg from "@/components/StaticImg";
import BlogPostEditor from "@/components/BlogPostEditor";
import { useAdminPosts } from "@/hooks/useAdminPosts";
import {
  getBlogImages,
  resolveBlogImageSrc,
  sortBlogPosts,
} from "@/lib/blog";

export default function AdminBlogPage() {
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    posts,
    createPost,
    updatePost,
    deletePost,
    isPublishing,
    publishProgress,
    isSavingEdit,
    editProgress,
  } = useAdminPosts();

  const orderedPosts = useMemo(() => sortBlogPosts(posts), [posts]);
  const stats = useMemo(() => {
    return {
      total: orderedPosts.length,
      featured: orderedPosts.filter((post) => post.featured).length,
      drafts: orderedPosts.filter((post) => post.status === "draft").length,
    };
  }, [orderedPosts]);

  async function handleCreate(formData: FormData) {
    try {
      await createPost(formData);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  }

  async function handleSave(postId: string, formData: FormData) {
    try {
      await updatePost(postId, formData);
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("Save failed. Check console for details.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    try {
      await deletePost(id);
    } catch (err) {
      console.error(err);
      alert("Delete failed. Check console for details.");
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
              Admin
            </p>
            <h1 className="mt-3 text-4xl font-extrabold text-gray-900">
              Blog Studio
            </h1>
            <p className="mt-3 max-w-3xl text-lg text-gray-700">
              Create new stories, tune image order, and keep the public blog
              feed aligned with the rest of the site.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/puppies"
              className="flex items-center justify-center rounded-full border border-emerald-500 px-5 py-3 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Puppy CRM
            </Link>
            <Link
              href="/admin/waitlist"
              className="flex items-center justify-center rounded-full border border-amber-500 px-5 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
            >
              Waitlist CRM
            </Link>
            <Link
              href="/blog"
              className="flex items-center justify-center rounded-full bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              View Public Blog
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Total Posts
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Featured
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.featured}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-stone-200 bg-white px-6 py-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
              Drafts
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {stats.drafts}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <BlogPostEditor
            mode="create"
            onSubmit={handleCreate}
            isSaving={isPublishing}
            progress={publishProgress}
          />
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
                Post Library
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Existing posts
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            {orderedPosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm"
              >
                {editingId === post.id ? (
                  <div className="p-4 sm:p-6">
                    <BlogPostEditor
                      mode="edit"
                      post={post}
                      onSubmit={(formData) => handleSave(post.id, formData)}
                      onCancel={() => setEditingId(null)}
                      isSaving={isSavingEdit}
                      progress={editProgress}
                    />
                  </div>
                ) : (
                  <div className="grid gap-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
                    <div className="relative min-h-[14rem] bg-stone-100">
                      <StaticImg
                        src={resolveBlogImageSrc(
                          post.coverImage || getBlogImages(post)[0]
                        )}
                        alt={post.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 18rem"
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-4 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
                              {post.status}
                            </span>
                            {post.featured ? (
                              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                                Featured
                              </span>
                            ) : null}
                          </div>
                          <h3 className="mt-3 text-2xl font-bold text-gray-900">
                            {post.title}
                          </h3>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(post.id)}
                            className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {(post.tags ?? []).slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4 text-sm text-stone-500">
                        <p>
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(post.publishedAt ?? post.id))}
                        </p>
                        <p>{post.images.length} images</p>
                      </div>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
