"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import StaticImg from "@/components/StaticImg";
import ImagePreviews from "@/components/ImagePreviews";
import {
  BLOG_STATUSES,
  deriveBlogExcerpt,
  getBlogImageIdentity,
  resolveBlogImageSrc,
} from "@/lib/blog";
import type { BlogPostLike } from "@/lib/blog";

type BlogPostEditorProps = {
  mode: "create" | "edit";
  post?: BlogPostLike;
  onSubmit: (formData: FormData) => Promise<void> | void;
  onCancel?: () => void;
  isSaving: boolean;
  progress: number;
};

type UploadedAsset = {
  file: File;
  preview: string;
};

export default function BlogPostEditor({
  mode,
  post,
  onSubmit,
  onCancel,
  isSaving,
  progress,
}: BlogPostEditorProps) {
  const initialConfig = useMemo(
    () => ({
      title: post?.title ?? "",
      body: post?.body ?? "",
      excerpt: post?.excerpt ?? deriveBlogExcerpt(post?.body ?? ""),
      tags: (post?.tags ?? []).join(", "),
      status: post?.status ?? "published",
      featured: Boolean(post?.featured),
      publishedAt:
        post?.publishedAt?.slice(0, 16) ?? new Date().toISOString().slice(0, 16),
      images: post?.images ?? [],
    }),
    [
      post?.body,
      post?.excerpt,
      post?.featured,
      post?.images,
      post?.publishedAt,
      post?.status,
      post?.tags,
      post?.title,
    ]
  );

  const [title, setTitle] = useState(initialConfig.title);
  const [body, setBody] = useState(initialConfig.body);
  const [excerpt, setExcerpt] = useState(initialConfig.excerpt);
  const [tags, setTags] = useState(initialConfig.tags);
  const [status, setStatus] = useState(initialConfig.status);
  const [featured, setFeatured] = useState(initialConfig.featured);
  const [publishedAt, setPublishedAt] = useState(initialConfig.publishedAt);
  const [existingImages, setExistingImages] = useState<string[]>(
    initialConfig.images
  );
  const [removedImages, setRemovedImages] = useState<Set<string>>(new Set());
  const [uploads, setUploads] = useState<UploadedAsset[]>([]);

  useEffect(() => {
    setTitle(initialConfig.title);
    setBody(initialConfig.body);
    setExcerpt(initialConfig.excerpt);
    setTags(initialConfig.tags);
    setStatus(initialConfig.status);
    setFeatured(initialConfig.featured);
    setPublishedAt(initialConfig.publishedAt);
    setExistingImages(initialConfig.images);
    setRemovedImages(new Set());
    setUploads((current) => {
      current.forEach((asset) => URL.revokeObjectURL(asset.preview));
      return [];
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  const visibleExistingImages = useMemo(
    () =>
      existingImages.filter(
        (src) => !removedImages.has(getBlogImageIdentity(src))
      ),
    [existingImages, removedImages]
  );

  const visibleUploads = useMemo(() => uploads.map((asset) => asset.preview), [uploads]);
  const coverPreview = visibleExistingImages[0] || visibleUploads[0] || "";
  const isDirty =
    title !== initialConfig.title ||
    body !== initialConfig.body ||
    excerpt !== initialConfig.excerpt ||
    tags !== initialConfig.tags ||
    status !== initialConfig.status ||
    featured !== initialConfig.featured ||
    publishedAt !== initialConfig.publishedAt ||
    removedImages.size > 0 ||
    uploads.length > 0 ||
    existingImages.join("|") !== initialConfig.images.join("|");

  function onFilesChanged(files: File[], previews: string[]) {
    setUploads((current) => [
      ...current,
      ...files.map((file, index) => ({
        file,
        preview: previews[index] || URL.createObjectURL(file),
      })),
    ]);
  }

  function removeUpload(index: number) {
    setUploads((current) => {
      const next = [...current];
      const [removed] = next.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.preview);
      return next;
    });
  }

  function toggleRemoveImage(src: string) {
    const identity = getBlogImageIdentity(src);
    setRemovedImages((current) => {
      const next = new Set(current);
      if (next.has(identity)) next.delete(identity);
      else next.add(identity);
      return next;
    });
  }

  function moveExistingImage(index: number, direction: -1 | 1) {
    setExistingImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function makeCover(src: string) {
    setExistingImages((current) => {
      const next = current.filter((item) => item !== src);
      next.unshift(src);
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("excerpt", excerpt);
    formData.append("tags", tags);
    formData.append("featured", featured ? "true" : "false");
    formData.append("status", status);
    formData.append("publishedAt", publishedAt);

    if (mode === "edit") {
      const deletedImages = post?.images?.filter((src) =>
        removedImages.has(getBlogImageIdentity(src))
      );
      formData.append("deletedImages", JSON.stringify(deletedImages ?? []));
      formData.append(
        "orderedImages",
        JSON.stringify(
          existingImages.filter(
            (src) => !removedImages.has(getBlogImageIdentity(src))
          )
        )
      );
    }

    uploads.forEach((asset) => formData.append("images", asset.file));
    await onSubmit(formData);
  }

  const titleLabel = mode === "create" ? "Create Post" : "Edit Post";
  const buttonLabel =
    mode === "create"
      ? isSaving
        ? `Publishing... ${progress}%`
        : "Publish Post"
      : isSaving
        ? `Saving... ${progress}%`
        : "Save Changes";

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_24rem]">
      <div className="space-y-6 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-700">
              {mode === "create" ? "New Entry" : "Existing Entry"}
            </p>
            <h2 className="mt-3 text-3xl font-bold text-gray-900">
              {titleLabel}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              Write the story, manage the images, and keep the public blog in
              sync with the admin tools.
            </p>
          </div>

          {mode === "edit" && onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-stone-50"
            >
              Cancel
            </button>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="A New Puppy Story"
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Excerpt
            </span>
            <textarea
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={3}
              placeholder="Short summary shown in the blog feed"
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Body
            </span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={10}
              placeholder="Write the full post here"
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
            />
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Status
            </span>
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as "published" | "draft" | "archived")
              }
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
            >
              {BLOG_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Publish Date
            </span>
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-gray-700">
              Tags
            </span>
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="puppies, litter, announcement"
              className="w-full rounded-2xl border border-stone-300 px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500"
            />
            <p className="mt-2 text-xs text-stone-500">
              Separate tags with commas.
            </p>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-stone-200 bg-stone-50 px-4 py-3">
          <label className="flex items-center gap-3 text-sm font-medium text-gray-900">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            Featured on blog
          </label>

          <p className="text-sm text-stone-600">
            Featured posts rise to the top of the feed.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Images</h3>
              <p className="text-sm text-stone-600">
                Drag files in, reorder existing images, or move a new image to
                the front by deleting and re-adding it later.
              </p>
            </div>
          </div>

          <ImagePreviews onChange={onFilesChanged} />

          {mode === "edit" && visibleExistingImages.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleExistingImages.map((src) => {
                const actualIndex = existingImages.indexOf(src);
                const identity = getBlogImageIdentity(src);
                const isRemoved = removedImages.has(identity);
                return (
                  <div
                    key={identity}
                    className={`rounded-3xl border p-3 transition ${
                      isRemoved
                        ? "border-stone-200 bg-stone-100 opacity-50"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
                      <StaticImg
                        src={resolveBlogImageSrc(src)}
                        alt={post?.title || "Blog image"}
                        fill
                        sizes="280px"
                        className="object-cover"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => makeCover(src)}
                        className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Make cover
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExistingImage(actualIndex, -1)}
                        className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-gray-800 transition hover:bg-stone-50"
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveExistingImage(actualIndex, 1)}
                        className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-gray-800 transition hover:bg-stone-50"
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleRemoveImage(src)}
                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                      >
                        {isRemoved ? "Undo" : "Remove"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {uploads.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {uploads.map((asset, index) => (
                <div
                  key={`${asset.preview}-${index}`}
                  className="rounded-3xl border border-stone-200 bg-white p-3"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-100">
                    <StaticImg
                      src={asset.preview}
                      alt={`Upload preview ${index + 1}`}
                      fill
                      sizes="280px"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="truncate text-sm text-stone-600">
                      {asset.file.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeUpload(index)}
                      className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {buttonLabel}
          </button>
          {mode === "create" ? (
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setBody("");
                setExcerpt("");
                setTags("");
                setStatus("published");
                setFeatured(false);
                setPublishedAt(new Date().toISOString().slice(0, 16));
                setExistingImages([]);
                setRemovedImages(new Set());
                setUploads((current) => {
                  current.forEach((asset) => URL.revokeObjectURL(asset.preview));
                  return [];
                });
              }}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-stone-50"
            >
              Reset
            </button>
          ) : null}
        </div>
      </div>

      <aside className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-stone-500">
            Preview
          </p>
          <h3 className="mt-3 text-2xl font-bold text-gray-900">
            {title || "Your post will appear here"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            This preview mirrors the public feed card and helps keep the blog
            layout aligned with the actual content.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-stone-50">
          <div className="relative aspect-[4/3] bg-stone-100">
            <StaticImg
              src={coverPreview ? resolveBlogImageSrc(coverPreview) : "/images/coming-soon.jpg"}
              alt={title || "Blog preview"}
              fill
              sizes="(max-width: 1024px) 100vw, 24rem"
              className="object-cover"
            />
          </div>

          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              {featured ? (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
                  Featured
                </span>
              ) : null}
              <span className="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-700">
                {status}
              </span>
            </div>

            <p className="text-sm leading-6 text-stone-700">
              {excerpt || deriveBlogExcerpt(body) || "No summary yet."}
            </p>

            <div className="flex flex-wrap gap-2">
              {tags
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            <div className="rounded-2xl bg-white px-4 py-3 text-sm text-stone-600">
              <p className="font-medium text-gray-900">Selected images</p>
              <p className="mt-1">
                {visibleExistingImages.length + uploads.length} total
              </p>
            </div>
          </div>
        </div>

        {mode === "edit" && post ? (
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
            <p className="font-medium text-gray-900">Editing post</p>
            <p className="mt-1 break-all">{post.id}</p>
          </div>
        ) : null}
      </aside>
    </form>
  );
}
