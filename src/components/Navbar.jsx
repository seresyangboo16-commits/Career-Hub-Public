// src/components/Navbar.jsx
// ─── Phase 1 Navigation Bar ──────────────────────────────────
// Simplified navbar for the registration-only phase.
// Shows only the CareerHub logo and a Register link.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for glass effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path) => pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/10"
          : "bg-slate-900 border-b border-slate-800"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">💼</span>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent group-hover:from-sky-300 group-hover:to-blue-400 transition-all">
              CareerHub
            </span>
          </Link>

          {/* Auth Links */}
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${
                isActive("/auth/login")
                  ? "bg-sky-500/15 text-sky-400"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${
                isActive("/auth/register")
                  ? "bg-sky-500/15 text-sky-400"
                  : "bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10"
              }`}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
