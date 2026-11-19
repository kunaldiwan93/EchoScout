'use client';

import CitationChip from '../workspace/CitationChip';
import CodeBlock from '../workspace/CodeBlock';
import EchoRings from '../ui/EchoRings';

export default function CoverExample() {
  const sampleCode = `async function fetchData() {
  try {
    const res = await fetch('/api/data');
    return await res.json();
  } catch (err) {
    console.error('Failed to load data', err);
  }
}`;

  return (
    <section className="py-16 md:py-24 border-t border-rule bg-sheet">
      <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <div className="flex items-center justify-between text-xs font-sans text-ink-soft">
          <span className="font-medium text-ink">In practice</span>
          <span className="uppercase tracking-wider text-[11px] font-mono">Example conversation</span>
        </div>

        {/* Replica of the workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border border-rule rounded-[12px] bg-paper p-6 md:p-8">
          {/* Left: CSS Video Frame & Timeline */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* CSS-drawn 16:9 video player frame */}
            <div className="relative w-full aspect-video rounded-[12px] bg-[#0A1A23] border border-rule overflow-hidden flex flex-col justify-between p-4 select-none">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#5F7C8B]">
                <span>YouTube 1080p</span>
                <span>Tutorial: Async JavaScript</span>
              </div>

              {/* Minimal CSS video playhead graphic */}
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-[#1F3A48] bg-[#112632] flex items-center justify-center text-[#6FA8C8]">
                  <EchoRings variant="mark" size={24} className="text-buoy" />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#DCE8EC]">
                <span>04:12</span>
                <span className="text-[#5F7C8B]">24:18</span>
              </div>
            </div>

            {/* Echo timeline replica with two markers */}
            <div className="flex flex-col gap-2 pt-1 select-none">
              <div className="flex items-center justify-between text-xs font-sans text-ink-soft">
                <span>Moments cited in answer</span>
                <span className="font-mono text-[11px]">2 cited</span>
              </div>

              <div className="relative w-full py-3">
                <div className="relative w-full h-[2px] bg-rule rounded-full">
                  {/* Marker at ~17% (04:12) */}
                  <div className="absolute left-[17%] top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <EchoRings variant="marker" size={18} active />
                  </div>
                  {/* Marker at ~21% (05:03) */}
                  <div className="absolute left-[21%] top-1/2 -translate-y-1/2 -translate-x-1/2">
                    <EchoRings variant="marker" size={18} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CitationChip timestamp="04:12" seconds={252} />
                <CitationChip timestamp="05:03" seconds={303} />
              </div>
            </div>
          </div>

          {/* Right: Realistic Question & Answer */}
          <div className="lg:col-span-6 flex flex-col gap-4 border-t lg:border-t-0 lg:border-l border-rule pt-6 lg:pt-0 lg:pl-8">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-sans font-medium text-ink-soft">Question</span>
              <h3 className="font-sans text-[16px] font-semibold text-ink leading-snug">
                How does error handling work with async and await?
              </h3>
            </div>

            <div className="border-t border-rule pt-4 flex flex-col gap-3">
              <span className="text-xs font-sans font-medium text-ink-soft">Answer</span>
              <p className="font-serif text-[18px] leading-[1.65] text-ink">
                When using async/await, rejected promises and thrown errors are caught using standard{' '}
                <code className="font-mono text-[14px] bg-sheet border border-rule px-1.5 py-0.5 rounded-[2px] text-ink">
                  try/catch
                </code>{' '}
                blocks <CitationChip timestamp="04:12" seconds={252} />. If you omit the catch block, the error bubbles up and triggers an unhandled promise rejection <CitationChip timestamp="05:03" seconds={303} />.
              </p>

              <CodeBlock language="javascript" code={sampleCode} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
