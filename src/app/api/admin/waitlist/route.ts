import { NextResponse } from "next/server";
import { isWaitlistRefundEligible, listWaitlist } from "@/data/waitlist";
import { requireAdminApi } from "@/lib/admin";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const entries = await listWaitlist();
  return NextResponse.json(
    entries.map((entry) => ({
      ...entry,
      refundEligible: isWaitlistRefundEligible(entry),
    }))
  );
}
