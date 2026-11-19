'use client';

export default function CoverGoodToKnow() {
  return (
    <section className="py-16 md:py-24 border-t border-rule bg-sheet">
      <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col gap-10">
        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="font-sans text-2xl md:text-3xl font-semibold tracking-[-0.035em] text-ink">
            Good to know
          </h2>
          <p className="font-sans text-sm md:text-base text-ink-soft leading-relaxed">
            Straightforward facts about how EchoScout behaves and what to expect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 text-sm font-sans">
          {/* Column 1: What it does */}
          <div className="flex flex-col gap-6">
            <h3 className="font-semibold text-ink text-base border-b border-rule pb-2">
              How it generates answers
            </h3>
            <ul className="space-y-4 text-ink-soft leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fathom mt-2 shrink-0" />
                <span>
                  <strong className="text-ink font-medium">Answers come from the captions</strong>, not from general web searches or external knowledge.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fathom mt-2 shrink-0" />
                <span>
                  <strong className="text-ink font-medium">Clear boundaries</strong>: if the video does not cover your question, the model states so directly rather than guessing.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fathom mt-2 shrink-0" />
                <span>
                  <strong className="text-ink font-medium">Clickable navigation</strong>: every timestamp citation lets you verify the answer against original video playback with one click.
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2: What to keep in mind */}
          <div className="flex flex-col gap-6">
            <h3 className="font-semibold text-ink text-base border-b border-rule pb-2">
              What to keep in mind
            </h3>
            <ul className="space-y-4 text-ink-soft leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-buoy mt-2 shrink-0" />
                <span>
                  <strong className="text-ink font-medium">Requires captions</strong>: works on videos with captions enabled, including auto-generated speech recognition.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-buoy mt-2 shrink-0" />
                <span>
                  <strong className="text-ink font-medium">Phonetic typo correction</strong>: auto-generated captions often mishear programming syntax. EchoScout is tuned to infer the correct concepts, but always double-check critical details using the timestamps.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-buoy mt-2 shrink-0" />
                <span>
                  <strong className="text-ink font-medium">No account needed</strong>: enter your link, ask your questions, and read without signing up.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
