import { useEffect, useState } from "react";
import type { BlogPostLike } from "@/lib/blog";

export function useAdminPosts() {
  const [posts, setPosts] = useState<BlogPostLike[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editProgress, setEditProgress] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/admin/posts");
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error(err);
    }
  }

  function uploadWithProgress(method: string, url: string, formData: FormData, onProgress: (p: number) => void) {
    return new Promise<unknown>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.onload = () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const text = xhr.responseText;
            resolve(text ? JSON.parse(text) : {});
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText} ${xhr.responseText}`));
          }
        } catch (err) {
          reject(err);
        }
      };
      xhr.onerror = () => reject(new Error("Network error"));
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.send(formData);
    });
  }

  async function createPost(formData: FormData) {
    try {
      setIsPublishing(true);
      setPublishProgress(0);
      const res = await uploadWithProgress("POST", "/api/admin/posts", formData, (p) => setPublishProgress(p));
      await fetchPosts();
      return res;
    } finally {
      setIsPublishing(false);
      setPublishProgress(0);
    }
  }

  async function updatePost(postId: string, formData: FormData) {
    try {
      setIsSavingEdit(true);
      setEditProgress(0);
      const res = await uploadWithProgress("PUT", `/api/admin/posts/${postId}`, formData, (p) => setEditProgress(p));
      await fetchPosts();
      return res;
    } finally {
      setIsSavingEdit(false);
      setEditProgress(0);
    }
  }

  async function deletePost(postId: string) {
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, { method: "DELETE" });
      if (res.ok) await fetchPosts();
      else console.error("Delete failed", await res.text());
    } catch (err) {
      console.error(err);
    }
  }

  return {
    posts,
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    isPublishing,
    publishProgress,
    isSavingEdit,
    editProgress,
  };
}
