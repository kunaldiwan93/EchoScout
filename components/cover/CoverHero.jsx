'use client';

import Link from 'next/link';

export default function CoverHero() {
  return (
    <section className="pt-16 pb-14 md:pt-24 md:pb-20 max-w-5xl mx-auto px-4 md:px-8 flex flex-col gap-10">
      {/* Asymmetric typographic hero copy */}
      <div className="flex flex-col gap-6 max-w-3xl">
        <h1 className="font-sans font-semibold text-ink tracking-[-0.035em] text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.98]">
          Ask a video anything.
          <br />
          Jump to the moment
          <br />
          it&apos;s explained.
        </h1>

        <p className="font-sans text-lg md:text-xl text-ink-soft leading-relaxed max-w-2xl">
          Paste a YouTube link, ask a question, and get an answer with timestamps that take you straight to the right part of the video.
        </p>

        <div className="flex items-center gap-5 pt-2 font-sans">
          <Link
            href="/app"
            className="inline-flex items-center justify-center font-medium bg-fathom text-sheet px-5 py-3 rounded-[6px] hover:opacity-90 transition-opacity text-base select-none"
          >
            Open EchoScout
          </Link>
          <a
            href="#how-it-works"
            className="text-base text-ink-soft hover:text-ink transition-colors underline underline-offset-4"
          >
            See how it works
          </a>
        </div>
      </div>

      {/* Hero Echo Timeline Graphic */}
      <div className="w-full pt-6 select-none">
        <div className="flex items-center justify-between text-xs font-mono text-ink-soft mb-2">
          <span>00:00</span>
          <span className="font-sans text-[11px] text-ink-soft uppercase tracking-wider">Example</span>
          <span>42:15</span>
        </div>

        {/* Inline SVG Timeline */}
        <div className="relative w-full overflow-visible py-3">
          <svg
            viewBox="0 0 1000 60"
            className="w-full h-auto overflow-visible"
            aria-label="Example echo timeline showing timestamps at 04:12, 18:40, and 31:05"
          >
            {/* Base timeline rail */}
            <line
              x1="0"
              y1="24"
              x2="1000"
              y2="24"
              stroke="var(--rule)"
              strokeWidth="2"
            />

            {/* Fine tick marks across the timeline */}
            {Array.from({ length: 41 }).map((_, i) => (
              <line
                key={`tick-${i}`}
                x1={i * 25}
                y1={i % 5 === 0 ? 17 : 20}
                x2={i * 25}
                y2={i % 5 === 0 ? 31 : 28}
                stroke="var(--rule)"
                strokeWidth={i % 5 === 0 ? '1.5' : '1'}
              />
            ))}

            {/* Marker 1: 04:12 async/await (~100px) */}
            <g className="cover-marker-1">
              <circle
                cx="100"
                cy="24"
                r="16"
                stroke="var(--buoy)"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
                className="animate-echo-pulse-once"
                style={{ animationDelay: '0ms' }}
              />
              <circle
                cx="100"
                cy="24"
                r="10"
                stroke="var(--buoy)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.75"
              />
              <circle cx="100" cy="24" r="4.5" fill="var(--buoy)" />
            </g>

            {/* Marker 2: 18:40 error handling (~442px) */}
            <g className="cover-marker-2">
              <circle
                cx="442"
                cy="24"
                r="18"
                stroke="var(--buoy)"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
                className="animate-echo-pulse-once"
                style={{ animationDelay: '120ms' }}
              />
              <circle
                cx="442"
                cy="24"
                r="11"
                stroke="var(--buoy)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.8"
              />
              <circle cx="442" cy="24" r="5" fill="var(--buoy)" />
            </g>

            {/* Marker 3: 31:05 deploying (~736px) */}
            <g className="cover-marker-3">
              <circle
                cx="736"
                cy="24"
                r="16"
                stroke="var(--buoy)"
                strokeWidth="1"
                fill="none"
                opacity="0.3"
                className="animate-echo-pulse-once"
                style={{ animationDelay: '240ms' }}
              />
              <circle
                cx="736"
                cy="24"
                r="10"
                stroke="var(--buoy)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.75"
              />
              <circle cx="736" cy="24" r="4.5" fill="var(--buoy)" />
            </g>
          </svg>

          {/* Labels under the markers */}
          <div className="relative w-full h-10 mt-1 select-none text-xs">
            <div className="absolute left-[10%] -translate-x-1/2 flex flex-col items-center">
              <span className="font-mono text-ink font-semibold">04:12</span>
              <span className="font-sans text-ink-soft text-[11px]">async/await</span>
            </div>

            <div className="absolute left-[44.2%] -translate-x-1/2 flex flex-col items-center">
              <span className="font-mono text-ink font-semibold">18:40</span>
              <span className="font-sans text-ink-soft text-[11px]">error handling</span>
            </div>

            <div className="absolute left-[73.6%] -translate-x-1/2 flex flex-col items-center">
              <span className="font-mono text-ink font-semibold">31:05</span>
              <span className="font-sans text-ink-soft text-[11px]">deploying</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
