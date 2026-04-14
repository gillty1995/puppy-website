import { NextResponse } from "next/server";
import { readCommentLeads } from "@/data/commentLeads";
import { requireAdminApi } from "@/lib/admin";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const leads = await readCommentLeads();
  return NextResponse.json(leads);
}
