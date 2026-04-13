import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

function getAllowedAdminEmails() {
  return (process.env.CLERK_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function isCurrentUserAdmin() {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await currentUser();
  const primaryEmail = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  if (!primaryEmail) return false;

  return getAllowedAdminEmails().includes(primaryEmail);
}

export async function requireAdminPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/");
  }
}

export async function requireAdminApi() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
