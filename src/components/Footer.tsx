// components/Footer.tsx
"use client";

import { useState } from "react";
import LoginModal from "./LoginModal";
import { useAdmin } from "@/app/context/AdminContext";

export default function Footer() {
  const { isAdmin, login, logout } = useAdmin();
  const [showLogin, setShowLogin] = useState(false);

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
        {/* Left side: site info */}
        <div
          className="
            flex flex-col items-center space-y-2 text-center 
            md:flex-row md:items-center md:space-y-0 md:space-x-3 md:text-left
          "
        >
          <p className="whitespace-nowrap">
            &copy; {new Date().getFullYear()} Textile Poms. All rights reserved.
          </p>
          <a
            href="https://gillhermelin.hec.to/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            Created by Gill Hermelin
          </a>
        </div>

        {/* Right side: admin / logout */}
        {!isAdmin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="px-3 py-1 border border-blue-400 rounded text-blue-400 hover:bg-blue-500 hover:text-white transition"
          >
            Admin
          </button>
        ) : (
          <button
            onClick={logout}
            className="px-3 py-1 border border-red-400 rounded text-red-400 hover:bg-red-500 hover:text-white transition"
          >
            Log Out
          </button>
        )}
      </div>

      {/* Login modal */}
      {showLogin && !isAdmin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={() => {
            login();
            setShowLogin(false);
          }}
        />
      )}
    </footer>
  );
}
