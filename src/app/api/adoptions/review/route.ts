import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireAdminApi } from "@/lib/admin";

const pendingPath = path.join(process.cwd(), "src", "data", "pendingReviews.json");

export async function POST(request: Request) {
  const review = await request.json();
  let pending = [];
  try {
    const raw = await fs.readFile(pendingPath, "utf-8");
    pending = JSON.parse(raw);
  } catch {
    pending = [];
  }
  pending.push(review);
  await fs.writeFile(pendingPath, JSON.stringify(pending, null, 2));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const raw = await fs.readFile(pendingPath, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}
