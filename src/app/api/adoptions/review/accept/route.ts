import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const pendingPath = path.join(process.cwd(), "src", "data", "pendingReviews.json");
const adoptionsPath = path.join(process.cwd(), "src", "data", "adoptions.json");

export async function POST(request: Request) {
  const { index } = await request.json();
  const pendingRaw = await fs.readFile(pendingPath, "utf-8");
  const adoptionsRaw = await fs.readFile(adoptionsPath, "utf-8");
  const pending = JSON.parse(pendingRaw);

  interface Review {
    adoptionId: string;
    name: string;
    review: string;
    createdAt?: string;
    rating?: number;
  }

  interface Adoption {
    id: string;
    reviews?: Review[];
    // add other properties as needed
  }

  const adoptions: Adoption[] = JSON.parse(adoptionsRaw);

  const review = pending[index];
  // Find the correct adoption by review.adoptionId
  const adoption = adoptions.find((a: Adoption) => a.id === review.adoptionId);
  if (adoption) {
    if (!adoption.reviews) adoption.reviews = [];
    adoption.reviews.push(review);
  }

  await fs.writeFile(adoptionsPath, JSON.stringify(adoptions, null, 2));
  pending.splice(index, 1);
  await fs.writeFile(pendingPath, JSON.stringify(pending, null, 2));
  return NextResponse.json({ ok: true });
}