"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-ivory)] border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-serif tracking-wide">
          GoldenWeft
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/collections" className="hover:opacity-70">
            Collections
          </Link>
          <Link href="/seasons" className="hover:opacity-70">
            Seasons
          </Link>
          <Link href="/styles" className="hover:opacity-70">
            Styles
          </Link>

          {/* Signature CTA */}
          <Link
            href="/find-your-silk"
            className="px-4 py-2 border border-black/20 rounded-soft hover:bg-black hover:text-white transition-all duration-300"
          >
            Find Your Silk ✨
          </Link>

          <Link href="/legacy" className="hover:opacity-70">
            Legacy
          </Link>
          <Link href="/exports" className="hover:opacity-70">
            Exports
          </Link>
        </nav>
      </div>
    </header>
  );
}
