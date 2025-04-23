// app/admin/blog/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  body: string;
  images: string[];
}

export default function AdminBlogPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isHover, setIsHover] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch("/api/admin/posts");
    if (res.ok) setPosts(await res.json());
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    imageFiles.forEach((file) => formData.append("images", file));

    const res = await fetch("/api/admin/posts", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      setTitle("");
      setBody("");
      setImageFiles([]);
      fetchPosts();
    } else {
      console.error("Upload failed", await res.text());
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) fetchPosts();
    else console.error("Delete failed", await res.json());
  };

  return (
    <section id="admin-blog" className="py-16 bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-4xl">
        {/* Styled Back to Home link */}
        <Link
          href="/#puppies"
          className="text-blue-600 hover:underline block mb-8"
        >
          &larr; Back to Home
        </Link>

        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-serif text-gray-900 mb-6">
            Admin: New Blog Post
          </h1>

          {/* Create Form */}
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

            {/* file picker */}
            <label className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 cursor-pointer transition">
              Choose Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) =>
                  e.target.files && setImageFiles(Array.from(e.target.files))
                }
                className="hidden"
              />
            </label>

            {imageFiles.length > 0 && (
              <div className="flex space-x-4 overflow-x-auto mt-4">
                {imageFiles.map((f) => (
                  <img
                    key={f.name + f.size}
                    src={URL.createObjectURL(f)}
                    alt="preview"
                    className="h-32 object-cover rounded-lg"
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
            >
              Publish Post
            </button>
          </form>
        </div>

        {/* Existing Posts & Delete */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-serif text-gray-900">Existing Posts</h2>
          {posts.map((p) => (
            <div
              key={p.id}
              className="bg-white p-6 rounded-lg shadow flex flex-col space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-gray-900">{p.title}</h3>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </div>

              <div className="flex space-x-4 overflow-x-auto">
                {p.images.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt={p.title}
                    className="h-32 object-cover rounded"
                  />
                ))}
              </div>

              <p className="text-gray-700">
                {p.body.length > 200
                  ? p.body.slice(0, 200).trim() + "…"
                  : p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
