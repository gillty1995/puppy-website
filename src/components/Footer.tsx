// components/Footer.tsx
"use client";

import Link from "next/link";
import { SignOutButton, UserButton, useAuth } from "@clerk/nextjs";

export default function Footer() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <footer className="py-8 bg-zinc-900 text-gray-300">
      <div
        className="
          container mx-auto         
          sm:px-6        
          flex flex-col items-center space-y-6
          md:flex-row md:justify-between md:space-y-0
        "
      >
        <div
          className="
            flex flex-col items-center space-y-2 text-center text-sm 
            md:flex-row md:items-center md:space-y-0 md:space-x-1 md:text-left
          "
        >
          <p className="whitespace-nowrap">
            &copy; {new Date().getFullYear()} Textile Poms. All rights reserved.
          </p>
          <a
            href="https://gillhermelin.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Developed by Gill Hermelin
          </a>
        </div>

        <div className="flex items-center space-x-4">
          {!isLoaded || !isSignedIn ? (
            <Link
              href="/sign-in"
              prefetch={false}
              className="px-3 py-1 border border-emerald-400 rounded text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
            >
              Admin Sign In
            </Link>
          ) : (
            <>
            <Link
              href="/admin/puppies"
              prefetch={false}
              className="px-3 py-1 border border-emerald-400 rounded text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
            >
              Admin Puppies
            </Link>
            <Link
              href="/admin/reviews"
              prefetch={false}
              className="px-3 py-1 border border-emerald-400 rounded text-emerald-400 hover:bg-emerald-500 hover:text-white transition"
            >
              Admin Reviews
            </Link>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
            <SignOutButton>
              <button className="px-3 py-1 border border-red-400 rounded text-red-400 hover:bg-red-500 hover:text-white transition">
                Log Out
              </button>
            </SignOutButton>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
