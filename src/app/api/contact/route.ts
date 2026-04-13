import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOCKED_LITERALS = new Set(["", "null", "undefined", "none", "n/a"]);
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

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

function normalizeField(value: FormDataEntryValue | null) {
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

async function verifyTurnstileToken(token: string, ip: string) {
  if (
    !process.env.TURNSTILE_SECRET_KEY ||
    !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  ) {
    console.error("Turnstile environment variables are missing.");
    return false;
  }

  const payload = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: ip,
  });

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });

    if (!response.ok) return false;

    const data = (await response.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return false;
  }
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many contact requests. Please try again later." },
      { status: 429 }
    );
  }

  const form = await request.formData();
  const email = normalizeField(form.get("email"));
  const message = normalizeField(form.get("message"));
  const website = normalizeField(form.get("website"));
  const turnstileToken = normalizeField(form.get("cf-turnstile-response"));

  if (website) {
    return NextResponse.json({ ok: true });
  }

  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken, ip))) {
    return NextResponse.json(
      { error: "Bot verification failed. Please try again." },
      { status: 400 }
    );
  }

  if (
    !email ||
    !message ||
    isBlockedLiteral(email) ||
    isBlockedLiteral(message) ||
    !EMAIL_REGEX.test(email) ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return NextResponse.json(
      { error: "Please enter a valid email and message." },
      { status: 400 }
    );
  }

  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_PORT ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS ||
    !process.env.ADMIN_EMAIL
  ) {
    console.error("Contact form is missing SMTP environment variables.");
    return NextResponse.json(
      { error: "Contact form is temporarily unavailable." },
      { status: 503 }
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ADMIN_EMAIL,
    replyTo: email,
    subject: `Adoption Inquiry from ${email}`,
    text: message,
  });

  return NextResponse.json({ ok: true });
}
