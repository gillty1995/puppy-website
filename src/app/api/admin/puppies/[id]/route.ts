import { NextResponse } from "next/server";
import { readPuppies, writePuppies } from "@/data/puppies";
import { requireAdminApi } from "@/lib/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const updates = await request.json();
  const puppies = await readPuppies();
  const index = puppies.findIndex((puppy) => puppy.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Puppy not found." }, { status: 404 });
  }

  const current = puppies[index];
  const resetPayment = Boolean(updates.resetPayment);
  puppies[index] = {
    ...current,
    currentPrice:
      updates.currentPrice === null || updates.currentPrice === ""
        ? null
        : Number(updates.currentPrice),
    depositAmount: Number(updates.depositAmount ?? current.depositAmount),
    status: updates.status ?? current.status,
    payment: resetPayment
      ? {
          reservedByEmail: updates.reservedByEmail || "",
          reservedByName: updates.reservedByName || "",
        }
      : {
          ...current.payment,
          reservedByEmail:
            updates.reservedByEmail ?? current.payment?.reservedByEmail,
          reservedByName:
            updates.reservedByName ?? current.payment?.reservedByName,
        },
  };

  await writePuppies(puppies);
  return NextResponse.json(puppies[index]);
}
