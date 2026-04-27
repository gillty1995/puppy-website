export function resolvePuppyImageSrc(src: string | null | undefined): string {
  if (!src) return "/images/coming-soon.jpg";

  const cleaned = src.replace(/^\/+/, "");
  if (/^https?:\/\//i.test(src)) return src;
  if (cleaned.startsWith("api/uploads/")) return `/${cleaned}`;
  if (cleaned.startsWith("uploads/") || cleaned.startsWith("variants/")) {
    return `/api/uploads/${cleaned}`;
  }
  if (cleaned.startsWith("images/")) return `/${cleaned}`;
  return src;
}
