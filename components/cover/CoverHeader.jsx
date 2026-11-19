'use client';

import Link from 'next/link';
import EchoRings from '../ui/EchoRings';
import ThemeToggle from '../ui/ThemeToggle';

export default function CoverHeader() {
  return (
    <header className="h-14 border-b border-rule bg-paper px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 select-none">
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-sans text-lg font-semibold tracking-[-0.035em] text-ink hover:opacity-85 transition-opacity"
        aria-label="EchoScout Home"
      >
        <span>Ech</span>
        <EchoRings variant="mark" size={17} className="text-buoy mx-[0.5px]" />
        <span>Scout</span>
      </Link>

      <div className="flex items-center gap-4 md:gap-6 text-sm font-sans">
        <a
          href="#how-it-works"
          className="text-ink-soft hover:text-ink transition-colors hidden sm:inline"
        >
          How it works
        </a>

        <Link
          href="/app"
          className="inline-flex items-center justify-center font-sans font-medium bg-fathom text-sheet px-3.5 py-1.5 rounded-[6px] hover:opacity-90 transition-opacity text-sm"
        >
          Open EchoScout
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
