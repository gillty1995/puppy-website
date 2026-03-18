import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireAdminApi } from "@/lib/admin";

const pendingPath = path.join(
  process.cwd(),
  "src",
  "data",
  "pendingReviews.json"
);

export async function POST(request: Request) {
  try {
    const unauthorized = await requireAdminApi();
    if (unauthorized) return unauthorized;

    const { index } = await request.json();
    const pendingRaw = await fs.readFile(pendingPath, "utf-8");
    const pending = JSON.parse(pendingRaw);

    if (!Number.isInteger(index) || index < 0 || index >= pending.length) {
      return NextResponse.json(
        { ok: false, error: "invalid_index" },
        { status: 400 }
      );
    }

    pending.splice(index, 1);
    await fs.writeFile(pendingPath, JSON.stringify(pending, null, 2));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("/api/adoptions/review/delete error:", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
