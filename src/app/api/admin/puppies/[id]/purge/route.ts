import { NextResponse } from "next/server";
import { deletePuppyRecord, readPuppyByIdIncludingArchived } from "@/data/puppies";
import { requireAdminApi } from "@/lib/admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const existing = await readPuppyByIdIncludingArchived(id);
  if (!existing) {
    return NextResponse.json({ error: "Puppy not found." }, { status: 404 });
  }

  if (!existing.archivedAt) {
    return NextResponse.json(
      { error: "Only archived puppies can be permanently deleted." },
      { status: 400 }
    );
  }

  const deleted = await deletePuppyRecord(id);
  if (!deleted) {
    return NextResponse.json({ error: "Puppy not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
