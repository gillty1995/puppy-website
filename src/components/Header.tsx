// components/Header.tsx
"use client";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useCallback, useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useAdmin } from "@/app/context/AdminContext";

export default function Header() {
  const { scrollY } = useScroll();
  // collapse header padding from 64px → 16px
  const paddingY = useTransform(scrollY, [0, 150], [64, 16]);
  // collapse nav bottom margin from 32px → 0
  const navMargin = useTransform(scrollY, [0, 150], [32, 0]);
  // transform title opacity based on scroll
  const titleOpacity = useTransform(scrollY, [0, 100], [1, 0]);
  // collapse title section height from 200px → 0
  const titleMaxHeight = useTransform(scrollY, [0, 150], [200, 0]);

  const { isAdmin } = useAdmin();
  const blogHref = isAdmin ? "/admin/blog" : "/blog";
  const [menuOpen, setMenuOpen] = useState(false);

  // Smooth scroll handler for nav links
  const handleNavClick = useCallback((section: string, e: React.MouseEvent) => {
    e.preventDefault();
    const id = section === "Home" ? "hero" : section.toLowerCase();
    const el = document.getElementById(id);
    if (!el) return;
    const collapsedHeaderHeight = 64; // px
    const topOfSection = el.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: topOfSection - collapsedHeaderHeight,
      behavior: "smooth",
    });
  }, []);

  return (
    <motion.header
      className="max-md:w-50% fixed top-0 left-0 w-full bg-white bg-opacity-95 shadow-md z-50"
      style={{ paddingTop: paddingY, paddingBottom: paddingY }}
    >
      <div className="max-w-7xl mx-auto px-8 flex flex-col items-center text-center">
        {/* Nav row */}
        <motion.nav
          className="w-full flex items-center justify-between"
          style={{ marginBottom: navMargin }}
        >
          <ul className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
            {["Home", "Parents", "Puppies", "Care", "Contact"].map((link) => (
              <li key={link}>
                <a
                  href={`#${link.toLowerCase()}`}
                  onClick={(e) => handleNavClick(link, e)}
                  className="hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
          <div className="boldonse text-2xl font-black tracking-wide text-gray-900">
            Textile Poms
          </div>
          <ul className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
            <li>
              <a href={blogHref} className="hover:underline">
                Blog
              </a>
            </li>
            <li>
              <a href="/about" className="hover:underline">
                About
              </a>
            </li>
          </ul>

          <button
            className="md:hidden text-gray-700 p-2"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </motion.nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              className="absolute top-full right-[-1] md:hidden bg-white shadow-md z-50 overflow-hidden origin-top"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ transformOrigin: "top" }}
            >
              <ul className="flex flex-col space-y-4 p-6 text-gray-700">
                {["Home", "Parents", "Puppies", "Care", "Contact"].map(
                  (link) => (
                    <li key={link}>
                      <a
                        href={`#${link.toLowerCase()}`}
                        onClick={(e) => {
                          handleNavClick(link, e);
                          setMenuOpen(false);
                        }}
                        className="block text-lg hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  )
                )}
                <li>
                  <a
                    href={blogHref}
                    onClick={() => setMenuOpen(false)}
                    className="block text-lg hover:underline"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    onClick={() => setMenuOpen(false)}
                    className="block text-lg hover:underline"
                  >
                    About
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title & subtitle collapse on scroll; each line fades in separately on load */}
        <motion.div
          className="block max-[769px]:hidden"
          style={{
            opacity: titleOpacity,
            maxHeight: titleMaxHeight,
            overflow: "hidden",
          }}
        >
          <motion.h1
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            Find Your Perfect Pomeranian
          </motion.h1>
          <motion.p
            className="petite-formal mt-4 text-lg md:text-xl text-gray-700"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.4 }}
          >
            Healthy, happy puppies raised with love — ready for their forever
            homes.
          </motion.p>
        </motion.div>
      </div>
    </motion.header>
  );
}
