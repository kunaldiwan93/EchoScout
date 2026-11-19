'use client';

import Link from 'next/link';
import EchoRings from '../ui/EchoRings';
import { ExternalLink } from 'lucide-react';

export default function CoverFooter() {
  return (
    <footer className="border-t border-rule bg-paper">
      {/* Final Call to Action banner */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          <h3 className="font-sans text-xl md:text-2xl font-semibold text-ink tracking-tight">
            Ready to search through video?
          </h3>
          <p className="font-sans text-sm text-ink-soft">
            Add any YouTube video with captions and ask questions immediately.
          </p>
        </div>

        <Link
          href="/app"
          className="inline-flex items-center justify-center font-sans font-medium bg-fathom text-sheet px-5 py-2.5 rounded-[6px] hover:opacity-90 transition-opacity text-sm shrink-0 select-none"
        >
          Open EchoScout
        </Link>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-rule">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans text-ink-soft">
          <div className="flex items-center gap-1 font-semibold text-ink tracking-[-0.035em]">
            <span>Ech</span>
            <EchoRings variant="mark" size={14} className="text-buoy mx-[0.5px]" />
            <span>Scout</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Built by Kunal</span>
            <a
              href="https://github.com/kunaldiwan93/EchoScout"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-fathom hover:underline font-medium"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
