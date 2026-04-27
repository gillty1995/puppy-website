import { NextResponse } from "next/server";
import { findWaitlistById, updateWaitlistEntry } from "@/data/waitlist";
import { requireAdminApi } from "@/lib/admin";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const entry = await findWaitlistById(id);
  if (!entry) {
    return NextResponse.json({ error: "Waitlist entry not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const status = body.status;
  const adminNotes = typeof body.adminNotes === "string" ? body.adminNotes : entry.adminNotes;

  const updated = await updateWaitlistEntry(id, {
    status:
      status === "pending" ||
      status === "paid" ||
      status === "contacted" ||
      status === "refund_eligible" ||
      status === "refunded"
        ? status
        : entry.status,
    adminNotes,
  });

  return NextResponse.json(updated);
}
