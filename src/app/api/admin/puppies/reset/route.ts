import { NextResponse } from "next/server";
import { readAllPuppies, resetCurrentLitter } from "@/data/puppies";
import { requireAdminApi } from "@/lib/admin";

export async function POST() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const before = await readAllPuppies();
  const activeCount = before.filter((puppy) => !puppy.archivedAt).length;
  const archivedCount = before.filter((puppy) => puppy.archivedAt).length;
  const freshPuppies = await resetCurrentLitter();

  return NextResponse.json({
    activeCount,
    archivedCount,
    freshPuppies,
  });
}
