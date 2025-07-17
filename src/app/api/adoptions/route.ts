import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "adoptions.json");

export async function GET() {
  const raw = await fs.readFile(filePath, "utf-8");
  return NextResponse.json(JSON.parse(raw));
}