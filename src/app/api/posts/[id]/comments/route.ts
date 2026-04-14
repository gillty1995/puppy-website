import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readPosts, writePosts, Comment } from "@/data/posts";
import { appendCommentLead } from "@/data/commentLeads";
import {
  createStoredComment,
  toPublicComment,
} from "@/lib/commentPrivacy";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const BLOCKED_LITERALS = new Set(["", "null", "undefined", "none", "n/a"]);

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("cf-connecting-ip") || "unknown";
}

function normalizeField(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isBlockedLiteral(value: string) {
  return BLOCKED_LITERALS.has(value.trim().toLowerCase());
}

function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  existing.count += 1;
  return false;
}

function looksLikeSpam(comment: string) {
  return (
    /https?:\/\//i.test(comment) ||
    /www\./i.test(comment) ||
    /<[^>]+>/.test(comment)
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many comments from this device. Please try again later." },
      { status: 429 }
    );
  }

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as
    | { email?: string; comment?: string }
    | null;
  const email = normalizeField(body?.email);
  const comment = normalizeField(body?.comment);

  if (
    !email ||
    !comment ||
    isBlockedLiteral(email) ||
    isBlockedLiteral(comment) ||
    !EMAIL_REGEX.test(email) ||
    comment.length < 3 ||
    comment.length > 1000 ||
    looksLikeSpam(comment)
  ) {
    return NextResponse.json(
      { error: "Please enter a real email and a safe comment." },
      { status: 400 }
    );
  }

  const posts = await readPosts();
  const idx = posts.findIndex((p) => p.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const newComment: Comment = createStoredComment(email, comment);

  posts[idx].comments = posts[idx].comments ?? [];
  posts[idx].comments.push(newComment);
  await writePosts(posts);
  await appendCommentLead({
    postId: posts[idx].id,
    postTitle: posts[idx].title,
    email,
    comment,
    createdAt: newComment.createdAt,
  });

  return NextResponse.json(toPublicComment(newComment));
}

// Optional: allow fetching comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const posts = await readPosts();
  const post = posts.find((p) => p.id === id);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json((post.comments ?? []).map(toPublicComment));
}
