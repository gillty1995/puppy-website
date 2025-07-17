import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const pendingPath = path.join(process.cwd(), "src", "data", "pendingReviews.json");

interface Review {
  adoptionId: string;
  name: string;
  review: string;
  createdAt?: string;
  rating?: number;
}

export async function POST(request: Request) {
  const review: Review = await request.json();
  let pending: Review[] = [];
  try {
    const raw = await fs.readFile(pendingPath, "utf-8");
    pending = JSON.parse(raw) as Review[];
  } catch {
    pending = [];
  }
  pending.push(review);
  await fs.writeFile(pendingPath, JSON.stringify(pending, null, 2));
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const raw = await fs.readFile(pendingPath, "utf-8");
  return NextResponse.json(JSON.parse(raw) as Review[]);
}