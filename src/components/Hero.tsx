"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      {/* Background image of both dogs */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/both4.jpg"
          alt="Mother and Father Pomeranian"
          fill
          className="object-cover object-[50%_-120%]"
          priority
        />
        {/* optional dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Expanded white header block */}
      <div className="absolute top-0 left-0 w-full bg-white bg-opacity-95 shadow-md z-20">
        <div className="max-w-7xl mx-auto px-8 py-16 flex flex-col items-center text-center">
          {/* Top navigation row */}
          <nav className="w-full flex items-center justify-between mb-8">
            <ul className="flex space-x-8 text-sm font-medium text-gray-700">
              {["Home", "Parents", "Puppies", "Care", "Contact"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="hover:underline"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
            <div className="text-2xl font-black tracking-wide text-gray-900">
              Pomeranian Pups
            </div>
            <ul className="flex space-x-8 text-sm font-medium text-gray-700">
              <li>
                <a href="/blog" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a href="/menu" className="hover:underline">
                  Menu
                </a>
              </li>
            </ul>
          </nav>

          {/* Moved Hero headline into header block */}
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            Find Your Perfect Pomeranian
          </motion.h1>
          <motion.p
            className="mt-4 text-lg md:text-xl text-gray-700 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Healthy, happy puppies raised with love — ready for their forever
            homes.
          </motion.p>
        </div>
      </div>

      {/* Empty spacer for vertical centering */}
      <div className="relative z-10 h-full" />
    </section>
  );
}
