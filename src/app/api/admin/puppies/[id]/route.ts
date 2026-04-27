import { NextResponse } from "next/server";
import {
  archivePuppy,
  readPuppyById,
  updatePuppy,
} from "@/data/puppies";
import { requireAdminApi } from "@/lib/admin";
import { storePuppyImage } from "@/lib/puppyImages";

function getFormValue(formData: FormData, key: string): string {
  return String(formData.get(key) || "").trim();
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const existing = await readPuppyById(id);
    if (!existing) {
      return NextResponse.json({ error: "Puppy not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const imageFile = formData.get("image");
    const nextImage =
      imageFile instanceof File ? await storePuppyImage(imageFile) : existing.image;

    const updated = await updatePuppy(id, {
      name: getFormValue(formData, "name") || existing.name,
      image: nextImage,
      currentPrice:
        getFormValue(formData, "currentPrice") === ""
          ? null
          : Number(getFormValue(formData, "currentPrice") || existing.currentPrice || 0),
      depositAmount: Number(
        getFormValue(formData, "depositAmount") || existing.depositAmount
      ),
      status:
        getFormValue(formData, "status") === "reserved" ||
        getFormValue(formData, "status") === "adopted"
          ? (getFormValue(formData, "status") as "reserved" | "adopted")
          : "available",
      age: getFormValue(formData, "age") || existing.age,
      color: getFormValue(formData, "color") || existing.color,
      description: getFormValue(formData, "description") || existing.description,
      skills: getFormValue(formData, "skills") || existing.skills,
      payment: {
        reservedByEmail: getFormValue(formData, "reservedByEmail"),
        reservedByName: getFormValue(formData, "reservedByName"),
      },
      resetPayment: formData.get("resetPayment") === "true",
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to save puppy." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const existing = await readPuppyById(id);
  if (!existing) {
    return NextResponse.json({ error: "Puppy not found." }, { status: 404 });
  }

  const archived = await archivePuppy(id);
  return NextResponse.json(archived);
}
