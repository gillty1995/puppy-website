// src/app/api/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const S3_BUCKET = process.env.S3_BUCKET || "";
const S3_REGION = process.env.AWS_REGION || process.env.S3_REGION || "us-east-2";
const S3_PREFIX = (process.env.S3_PREFIX || "").replace(/^\/|\/$/g, "");
const CDN_URL = (process.env.NEXT_PUBLIC_CDN_URL || "").replace(/\/$/g, "");

// Build a public S3 URL (only useful if bucket is public; with OAC it will 403)
function toPublicS3Url(key: string) {
  const cleanKey = key.replace(/^\/+/, "");
  const fullKey = S3_PREFIX ? `${S3_PREFIX}/${cleanKey}` : cleanKey;
  const encoded = encodeURIComponent(fullKey).replace(/%2F/g, "/");
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${encoded}`;
}

function normalizeToKey(input: string) {
  if (!input) return "";

  // fix "https:/..." -> "https://..."
  const repaired = input.replace(/^(https?:)\/+/, "$1//");

  // full URL (S3 or CloudFront or anything) -> use pathname as key
  if (/^https?:\/\//i.test(repaired)) {
    try {
      const u = new URL(repaired);
      return u.pathname.replace(/^\/+/, ""); // "uploads/...."
    } catch {
      // fallthrough
    }
  }

  // "/uploads/.." or "uploads/.." -> "uploads/.."
  return repaired.replace(/^\/+/, "");
}

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);

  // everything after /api/uploads/
  let rel = pathname.replace(/^\/api\/uploads\//, "");

  // Normalize to a key like "uploads/..." or "variants/..."
  rel = normalizeToKey(rel);

  // If S3 configured, redirect to CDN (preferred) or S3 URL
  const looksLikeKey =
    rel.startsWith("uploads/") ||
    rel.startsWith("variants/") ||
    (S3_PREFIX && rel.startsWith(`${S3_PREFIX}/`));

  let localRel = rel;
  if (localRel.startsWith("uploads/")) localRel = localRel.replace(/^uploads\//, "");

  const filePath = path.join(process.cwd(), "public", "uploads", localRel);

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
        ? "image/png"
        : ext === "webp"
        ? "image/webp"
        : "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: { "Content-Type": mime },
    });
  } catch {
    if (S3_BUCKET && looksLikeKey) {
      // If rel already includes prefix, keep it, otherwise prepend prefix in the URL builder
      const key = rel.replace(/^\/+/, "");
      const url = CDN_URL ? `${CDN_URL}/${key}` : toPublicS3Url(key);
      return NextResponse.redirect(url);
    }

    return new NextResponse("Not found", { status: 404 });
  }
}
