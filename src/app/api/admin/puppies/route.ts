import { NextResponse } from "next/server";
import { readPuppies } from "@/data/puppies";
import { requireAdminApi } from "@/lib/admin";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const puppies = await readPuppies();
  return NextResponse.json(puppies);
}
