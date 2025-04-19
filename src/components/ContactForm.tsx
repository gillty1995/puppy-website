"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const form = new FormData(e.target as HTMLFormElement);
    await fetch("/api/contact", { method: "POST", body: form });
    setStatus("sent");
  };

  return (
    <section id="contact" className="relative py-16 bg-stone-100 px-6 md:px-20">
      {/* Heading */}
      <h2 className="text-3xl font-serif text-gray-900 mb-8 text-center">
        Every question leads home - Inquire now!
      </h2>

      <div className="relative max-w-2xl mx-auto">
        {/* Left: beating heart icon closer */}
        <motion.img
          src="/images/heart-icon.png"
          alt="Heart"
          className="absolute left-[-17.5rem] w-24 h-   rotate-[-20deg]"
          style={{ top: "10%", transform: "translateY(-50%)" }}
          initial={{ filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" }}
          whileHover={{ filter: "drop-shadow(0 0 12px rgba(255,100,150,0.8))" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Right: static puppy icon closer */}
        <motion.img
          src="/images/puppy-icon.png"
          alt="Puppy"
          className="absolute right-[-15.5rem] w-24 h-24"
          style={{ top: "50%", transform: "translateY(-50%)" }}
          initial={{ filter: "drop-shadow(0 0 0 rgba(0,0,0,0))" }}
          whileHover={{ filter: "drop-shadow(0 0 12px rgba(100,200,255,0.8))" }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Original form, unchanged */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email input with arrow */}
          <div className="relative">
            <input
              name="email"
              type="email"
              placeholder="Email address"
              required
              className="
                w-full
                border-b-2 border-gray-400
                bg-transparent
                py-2 pr-12
                text-lg text-gray-900
                placeholder-gray-500
                focus:outline-none
              "
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="
                absolute top-1/2 right-0 -translate-y-1/2
                p-2
                text-gray-700
                hover:text-gray-900
                focus:outline-none
              "
            >
              <FaArrowRight size={24} />
            </button>
          </div>

          {/* Message textarea */}
          <textarea
            name="message"
            rows={4}
            placeholder="Your questions..."
            required
            className="
              w-full border-b-2 border-gray-400 bg-transparent
              py-2 text-lg text-gray-900 placeholder-gray-500
              focus:outline-none
            "
          />

          {/* Fine print */}
          <p className="text-xs text-gray-500">
            By entering your email and clicking the arrow, you agree to receive
            emails from us. Unsubscribe anytime; see our Privacy Policy & Terms.
          </p>
        </form>
      </div>
    </section>
  );
}
