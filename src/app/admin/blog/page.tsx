"use client";

import { useState } from "react";
import Link from "next/link";
import StaticImg from "@/components/StaticImg";
import ImagePreviews from "@/components/ImagePreviews";
import EditPostForm from "@/components/EditPostForm";
import { useAdminPosts } from "@/hooks/useAdminPosts";

export default function AdminBlogPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isHover, setIsHover] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    posts,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    isPublishing,
    publishProgress,
    isSavingEdit,
    editProgress,
  } = useAdminPosts();

  function onCreateFilesChanged(files: File[], urls: string[]) {
    setImageFiles(files);
    setPreviews(urls);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    imageFiles.forEach((file) => formData.append("images", file));
    try {
      await createPost(formData);
      setTitle("");
      setBody("");
      setImageFiles([]);
      setPreviews([]);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console for details.");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    await deletePost(id);
    fetchPosts();
  }

  function startEdit(id: string) {
    setEditingId(id);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function handleSaveFromForm(postId: string, formData: FormData) {
    try {
      await updatePost(postId, formData);
      setEditingId(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Save failed. Check console for details.");
    }
  }

  return (
    <section id="admin-blog" className="py-16 bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/#puppies"
          className="text-black hover:underline block mb-8"
        >
          &larr; Back to Home
        </Link>
        <Link
          href="/admin/puppies"
          className="text-emerald-700 hover:underline block mb-8"
        >
          Manage Puppy Pricing & Payments
        </Link>
        <Link
          href="/admin/waitlist"
          className="text-amber-700 hover:underline block mb-8"
        >
          Manage Waitlist CRM
        </Link>

        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-serif text-gray-900 mb-6">
            Admin: New Blog Post
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-emerald-500 text-black"
            />

            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Body"
              rows={6}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-emerald-500 text-black"
            />

            <ImagePreviews onChange={onCreateFilesChanged} />

            {previews.length > 0 && (
              <div className="flex space-x-4 overflow-x-auto mt-4">
                {previews.map((src, i) => (
                  <StaticImg
                    key={i}
                    src={src}
                    alt="preview"
                    width={128}
                    height={128}
                    className="h-32 w-auto object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              onMouseEnter={() => setIsHover(true)}
              onMouseLeave={() => setIsHover(false)}
              style={{ backgroundColor: isHover ? "#10B981" : "#059669" }}
              className="w-full text-white py-2 rounded-4xl cursor-pointer transition-colors duration-200 ease-in-out"
              disabled={isPublishing}
            >
              {isPublishing
                ? `Publishing... ${publishProgress}%`
                : "Publish Post"}
            </button>
          </form>
        </div>

        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-serif text-gray-900">Existing Posts</h2>
          {posts.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-lg shadow flex flex-col space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{p.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startEdit(p.id)}
                    className="px-3 py-1 bg-amber-600 text-white rounded-full hover:bg-amber-500 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {editingId === p.id ? (
                <EditPostForm
                  post={p}
                  onCancel={cancelEdit}
                  onSave={(formData) => handleSaveFromForm(p.id, formData)}
                  isSaving={isSavingEdit}
                  progress={editProgress}
                />
              ) : (
                <>
                  <div className="flex space-x-4 overflow-x-auto">
                    {p.images.map((src) => {
                      const filename = src.replace(/^\/uploads\//, "");
                      return (
                        <StaticImg
                          key={src}
                          src={`/api/uploads/${filename}`}
                          alt={p.title}
                          width={400}
                          height={580}
                          className="h-32 object-cover rounded"
                        />
                      );
                    })}
                  </div>

                  <p className="text-gray-700">
                    {p.body.length > 200
                      ? p.body.slice(0, 200).trim() + "…"
                      : p.body}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
