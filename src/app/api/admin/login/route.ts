import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { user, pass } = await request.json();
  if (
    user === process.env.ADMIN_USER &&
    pass === process.env.ADMIN_PASS
  ) {
    // In production, set a secure httpOnly cookie or token
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ success: false }, { status: 401 });
}