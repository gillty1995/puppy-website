export function resolvePuppyImageSrc(
  src: string | null | undefined,
  fallback = "/images/coming-soon.jpg"
): string {
  if (!src) return fallback;

  const cleaned = src.replace(/^\/+/, "");
  if (/^https?:\/\//i.test(src)) {
    try {
      const url = new URL(src);
      const host = url.hostname.toLowerCase();
      const pathname = url.pathname.replace(/^\/+/, "");

      if (
        host.endsWith("cloudfront.net") ||
        host.includes(".s3.") ||
        host.startsWith("s3.")
      ) {
        return `/api/uploads/${pathname}`;
      }
    } catch {
      return src;
    }
  }
  if (cleaned.startsWith("api/uploads/")) return `/${cleaned}`;
  if (cleaned.startsWith("uploads/") || cleaned.startsWith("variants/")) {
    return `/api/uploads/${cleaned}`;
  }
  if (cleaned.startsWith("images/")) return `/${cleaned}`;
  return src;
}
