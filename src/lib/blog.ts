import { resolvePuppyImageSrc } from "@/lib/puppyImageSrc";

export type BlogPostStatus = "published" | "draft" | "archived";

export type BlogImageVariants = Record<string, { thumb: string; large: string }>;

export type BlogPostLike = {
  id: string;
  title: string;
  body: string;
  images: string[];
  imageUrl?: string;
  excerpt?: string;
  coverImage?: string;
  featured?: boolean;
  status?: BlogPostStatus;
  publishedAt?: string;
  tags?: string[];
  variants?: BlogImageVariants;
  comments?: unknown[];
};

export const BLOG_STATUSES: BlogPostStatus[] = [
  "published",
  "draft",
  "archived",
];

export function resolveBlogImageSrc(src: string | null | undefined): string {
  return resolvePuppyImageSrc(src, "/images/coming-soon.jpg");
}

export function getBlogImageIdentity(src: string | null | undefined): string {
  if (!src) return "";

  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const u = new URL(src);
      return u.pathname.replace(/^\/+/, "");
    } catch {
      return src.replace(/^\/+/, "");
    }
  }

  const cleaned = src.replace(/^\/+/, "");
  if (cleaned.startsWith("api/uploads/")) {
    return cleaned.replace(/^api\//, "");
  }

  return cleaned;
}

export function getBlogImages(post: Partial<BlogPostLike>): string[] {
  const images = Array.isArray(post.images) ? post.images : [];
  if (images.length > 0) return images;
  return post.imageUrl ? [post.imageUrl] : [];
}

export function deriveBlogExcerpt(body: string, maxLength = 160): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= maxLength) return normalized;

  const sliced = normalized.slice(0, maxLength);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 80 ? lastSpace : maxLength).trim()}…`;
}

export function getBlogPublishedAt(post: Partial<BlogPostLike>): string {
  if (typeof post.publishedAt === "string" && post.publishedAt) {
    return post.publishedAt;
  }

  if (post.id && /^\d+$/.test(post.id)) {
    const fromId = new Date(Number(post.id));
    if (!Number.isNaN(fromId.getTime())) {
      return fromId.toISOString();
    }
  }

  return new Date().toISOString();
}

export function normalizeBlogTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
    .filter(Boolean);
}

export function normalizeBlogPost<T extends BlogPostLike>(post: T): T & {
  excerpt: string;
  coverImage: string;
  featured: boolean;
  status: BlogPostStatus;
  publishedAt: string;
  tags: string[];
} {
  const images = getBlogImages(post);
  const coverImage = resolveBlogImageSrc(post.coverImage || images[0] || null);
  const status = BLOG_STATUSES.includes(post.status as BlogPostStatus)
    ? (post.status as BlogPostStatus)
    : "published";

  return {
    ...post,
    images,
    excerpt: typeof post.excerpt === "string" && post.excerpt.trim()
      ? post.excerpt.trim()
      : deriveBlogExcerpt(post.body || ""),
    coverImage,
    featured: Boolean(post.featured),
    status,
    publishedAt: getBlogPublishedAt(post),
    tags: normalizeBlogTags(post.tags),
  };
}

export function sortBlogPosts<T extends BlogPostLike>(posts: T[]) {
  return [...posts].sort((a, b) => {
    const normalizedA = normalizeBlogPost(a);
    const normalizedB = normalizeBlogPost(b);

    if (normalizedA.status !== normalizedB.status) {
      if (normalizedA.status === "published") return -1;
      if (normalizedB.status === "published") return 1;
    }

    if (normalizedA.featured !== normalizedB.featured) {
      return normalizedA.featured ? -1 : 1;
    }

    const timeA = new Date(normalizedA.publishedAt).getTime();
    const timeB = new Date(normalizedB.publishedAt).getTime();

    if (timeA !== timeB) return timeB - timeA;

    return String(normalizedB.id).localeCompare(String(normalizedA.id));
  });
}

export function readBlogPostFormData(formData: FormData) {
  const title = formData.get("title")?.toString().trim() || "";
  const body = formData.get("body")?.toString() || "";
  const excerpt = formData.get("excerpt")?.toString().trim() || "";
  const tagsRaw = formData.get("tags")?.toString() || "";
  const tags = normalizeBlogTags(
    tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  );
  const featured = formData.get("featured")?.toString() === "true";
  const statusValue = formData.get("status")?.toString() || "published";
  const status = BLOG_STATUSES.includes(statusValue as BlogPostStatus)
    ? (statusValue as BlogPostStatus)
    : "published";
  const publishedAt = formData.get("publishedAt")?.toString().trim() || "";

  return {
    title,
    body,
    excerpt,
    tags,
    featured,
    status,
    publishedAt,
  };
}

export function parseOrderedImages(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  } catch {
    return [];
  }
}
