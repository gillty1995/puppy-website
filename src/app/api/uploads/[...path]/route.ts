// src/app/api/uploads/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  // extract everything after "/api/uploads/"
  const { pathname } = new URL(request.url);
  const fileRelative = pathname.replace(/^\/api\/uploads\//, "");
  const filePath = path.join(
    process.cwd(),
    "public",
    "uploads",
    fileRelative
  );

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime =
      ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "png"
        ? "image/png"
        : "application/octet-stream";

    return new NextResponse(data, {
      status: 200,
      headers: { "Content-Type": mime },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}