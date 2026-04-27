import { NextResponse } from "next/server";
import { createPuppy, readAllPuppies } from "@/data/puppies";
import { requireAdminApi } from "@/lib/admin";
import { storePuppyImage } from "@/lib/puppyImages";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const puppies = await readAllPuppies();
  const active = puppies.filter((puppy) => !puppy.archivedAt);
  const archived = puppies.filter((puppy) => puppy.archivedAt);
  return NextResponse.json([...active, ...archived]);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const formData = await request.formData();
    const name = String(formData.get("name") || "").trim();
    const age = String(formData.get("age") || "").trim();
    const color = String(formData.get("color") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const skills = String(formData.get("skills") || "").trim();
    const status = formData.get("status") === "reserved" || formData.get("status") === "adopted"
      ? (formData.get("status") as "reserved" | "adopted")
      : "available";
    const currentPriceRaw = String(formData.get("currentPrice") || "").trim();
    const depositAmountRaw = String(formData.get("depositAmount") || "").trim();
    const imageFile = formData.get("image");

    if (!name) {
      return NextResponse.json({ error: "Puppy name is required." }, { status: 400 });
    }

    if (!(imageFile instanceof File)) {
      return NextResponse.json({ error: "A puppy image is required." }, { status: 400 });
    }

    const image = await storePuppyImage(imageFile);
    const created = await createPuppy({
      name,
      image,
      currentPrice: currentPriceRaw === "" ? null : Number(currentPriceRaw),
      depositAmount: depositAmountRaw === "" ? 1000 : Number(depositAmountRaw),
      status,
      age,
      color,
      description,
      skills,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unable to create puppy." },
      { status: 500 }
    );
  }
}
