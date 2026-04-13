import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Legacy admin login is disabled. Use Clerk sign-in instead." },
    { status: 410 }
  );
}
