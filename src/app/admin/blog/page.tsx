"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Link from "next/link";
import StaticImg from "@/components/StaticImg";

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
  const [previews, setPreviews] = useState<string[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isHover, setIsHover] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const res = await fetch("/api/admin/posts");
    if (res.ok) setPosts(await res.json());
  }

  // build previews, converting HEIC→JPEG in-browser
  async function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    // dynamic import only in browser
    const { default: heic2any } = await import("heic2any");

    const files = e.target.files ? Array.from(e.target.files) : [];
    setImageFiles(files);

    const urls: string[] = [];

    for (const file of files) {
      const isHeic =
        /\.heic$/i.test(file.name) ||
        file.type === "image/heic" ||
        file.type === "image/heif";

      if (isHeic) {
        try {
          const output = (await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8,
          })) as Blob;
          urls.push(URL.createObjectURL(output));
        } catch (error) {
          console.error("HEIC→JPEG failed:", error);
          // skip preview for this file
        }
      } else {
        // non-HEIC: blob URL
        urls.push(URL.createObjectURL(file));
      }
    }

    setPreviews(urls);
  }

  async function handleSubmit(e: React.FormEvent) {
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
      setPreviews([]);
      fetchPosts();
    } else {
      console.error("Upload failed", await res.text());
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    if (res.ok) fetchPosts();
    else console.error("Delete failed", await res.json());
  }

  return (
    <section id="admin-blog" className="py-16 bg-gray-50 px-6 md:px-20">
      <div className="mx-auto max-w-4xl">
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

            <label className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 cursor-pointer transition">
              Choose Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

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
            >
              Publish Post
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
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-full hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </div>

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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
