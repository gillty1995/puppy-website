"use client";

import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, pass }),
    });
    if (res.ok) {
      localStorage.setItem("isAdmin", "true");
      onLoginSuccess(); // your existing callback
      onClose();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg relative w-80">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:scale-125 transition-transform duration-200 ease-in-out"
          onClick={onClose}
        >
          <FaTimes />
        </button>
        <h2 className="text-xl mb-4 text-black">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full p-2 border rounded text-gray-800"
          />
          <input
            type="password"
            placeholder="Password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full p-2 border rounded text-gray-800"
          />
          {error && <p className="text-red-600">{error}</p>}
          <button
            type="submit"
            style={{ backgroundColor: "#059669" }}
            className="w-full hover:text-blue-400 text-white py-2 rounded cursor-pointer"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
