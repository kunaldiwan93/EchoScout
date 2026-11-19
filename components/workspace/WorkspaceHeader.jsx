'use client';

import Link from 'next/link';
import EchoRings from '../ui/EchoRings';
import ThemeToggle from '../ui/ThemeToggle';
import LinkBar from './LinkBar';

export default function WorkspaceHeader({
  url,
  setUrl,
  onAddVideo,
  status,
  onResetStatus,
  showLinkBar = true,
  className = '',
}) {
  return (
    <header className={`h-14 border-b border-rule bg-paper px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-40 select-none ${className}`}>
      {/* Wordmark */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 font-sans text-lg font-semibold tracking-[-0.035em] text-ink hover:opacity-85 transition-opacity"
        aria-label="EchoScout Home"
      >
        <span>Ech</span>
        <EchoRings variant="mark" size={17} className="text-buoy mx-[0.5px]" />
        <span>Scout</span>
      </Link>

      {/* Link bar in header if video is active */}
      {showLinkBar && (
        <div className="hidden sm:block flex-1 max-w-xl mx-4">
          <LinkBar
            url={url}
            setUrl={setUrl}
            onAddVideo={onAddVideo}
            status={status}
            onResetStatus={onResetStatus}
          />
        </div>
      )}

      {/* Right side: Theme toggle */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
