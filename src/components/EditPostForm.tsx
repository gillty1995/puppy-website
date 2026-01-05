"use client";

import StaticImg from "@/components/StaticImg";
import ImagePreviews from "@/components/ImagePreviews";
import { useState } from "react";

interface Post {
  id: string;
  title: string;
  body: string;
  images: string[];
}

export default function EditPostForm({
  post,
  onCancel,
  onSave,
  isSaving,
  progress,
}: {
  post: Post;
  onCancel: () => void;
  onSave: (formData: FormData) => void;
  isSaving: boolean;
  progress: number;
}) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [deletedImages, setDeletedImages] = useState<Set<string>>(new Set());
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);

  const isDirty =
    title !== post.title ||
    body !== post.body ||
    deletedImages.size > 0 ||
    newFiles.length > 0;

  function toggleDelete(src: string) {
    const filename = src.replace(/^\/uploads\//, "");
    setDeletedImages((prev) => {
      const copy = new Set(prev);
      if (copy.has(filename)) copy.delete(filename);
      else copy.add(filename);
      return copy;
    });
  }

  function onFilesChanged(files: File[], previews: string[]) {
    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previews]);
  }

  function handleSave() {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("deletedImages", JSON.stringify(Array.from(deletedImages)));
    newFiles.forEach((f) => formData.append("images", f));
    onSave(formData);
  }

  return (
    <div className="bg-gray-50 p-4 rounded">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded mb-2 text-black"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        className="w-full p-2 border rounded mb-2 text-black"
      />
      <div className="mb-2">
        <div className="text-sm text-gray-600 mb-1">
          Existing images (click to toggle remove)
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {post.images.map((src) => {
            const filename = src.replace(/^\/uploads\//, "");
            const isDeleted = deletedImages.has(filename);
            return (
              <div key={src} className="relative">
                <StaticImg
                  src={
                    // if already an API proxy path, use it
                    src.startsWith("/api/uploads/")
                      ? src
                      : (() => {
                          const cdn = process.env.NEXT_PUBLIC_CDN_URL || "";
                          const filename = src.replace(/^\/uploads\//, "");
                          if (src.startsWith("/uploads/"))
                            return cdn
                              ? `${cdn}/${filename}`
                              : `/api/uploads/${filename}`;
                          if (/^uploads\//.test(src))
                            return cdn
                              ? `${cdn}/${src}`
                              : `/api/uploads/${src.replace(/^uploads\//, "")}`;
                          return src;
                        })()
                  }
                  alt={post.title}
                  width={160}
                  height={120}
                  className={`h-24 w-auto object-cover rounded ${
                    isDeleted ? "opacity-40" : ""
                  }`}
                />
                <button
                  onClick={() => toggleDelete(src)}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                  title={isDeleted ? "Undo remove" : "Remove image"}
                  type="button"
                >
                  {isDeleted ? "↺" : "✕"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <ImagePreviews onChange={onFilesChanged} />
      {newPreviews.length > 0 && (
        <div className="flex space-x-4 overflow-x-auto mt-4">
          {newPreviews.map((src, i) => (
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
      <div className="flex space-x-2 mt-4">
        <button
          onClick={handleSave}
          className={`px-4 py-2 bg-emerald-600 text-white rounded ${
            isDirty ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          disabled={isSaving || !isDirty}
        >
          {isSaving ? `Saving... ${progress}%` : "Save Changes"}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 rounded cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
