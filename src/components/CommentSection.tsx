"use client";

import { useState, useEffect } from "react";
import { PublicComment } from "@/lib/commentPrivacy";

export default function CommentsSection({ postId }: { postId: string }) {
  const [isHover, setIsHover] = useState(false);
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "error" | "success"
  >("idle");

  // load existing comments
  useEffect(() => {
    fetch(`/api/posts/${postId}/comments`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [postId]);

  // submit a new comment
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, comment: text }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Submission failed. Please try again.");
      }
      const newC = await res.json();
      setComments((c) => [...c, newC]);
      setEmail("");
      setText("");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Submission failed. Please try again."
      );
    }
  };

  return (
    <div className="mt-12 border-t border-gray-300 pt-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comments</h2>

      {/* existing comments */}
      <div className="space-y-4 mb-6">
        {comments.map((c) => (
          <div key={c.createdAt} className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              {c.maskedEmail} • {new Date(c.createdAt).toLocaleString()}
            </p>
            <p className="text-gray-800">{c.comment}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-gray-500">No comments yet. Be the first!</p>
        )}
      </div>

      {/* form */}
      {status === "success" && (
        <p className="text-emerald-600 mb-4">Thanks for your comment!</p>
      )}
      {status === "error" && (
        <p className="text-red-600 mb-4">{error}</p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 text-black"
          />
        </div>
        <div>
          <label htmlFor="comment" className="block text-gray-700 mb-1">
            Comment
          </label>
          <textarea
            id="comment"
            rows={4}
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 text-black"
          />
        </div>
        <button
          type="submit"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}
          disabled={status === "sending"}
          style={{ backgroundColor: isHover ? "#10B981" : "#059669" }}
          className="w-full text-white py-2 rounded-4xl cursor-pointer transition-colors duration-200 ease-in-out"
        >
          {status === "sending" ? "Sending..." : "Submit Comment"}
        </button>
      </form>
    </div>
  );
}
