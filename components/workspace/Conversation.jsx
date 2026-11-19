'use client';

import { useRef, useEffect } from 'react';
import Answer from './Answer';
import Composer from './Composer';
import EchoRings from '../ui/EchoRings';
import { RotateCcw } from 'lucide-react';

export default function Conversation({
  messages = [],
  input,
  setInput,
  onSubmit,
  onStop,
  onRetry,
  onSeek,
  onClearConversation,
  isSearching = false,
  isStreaming = false,
  hasError = false,
  onStarterPrompt,
  className = '',
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const userScrolledUpRef = useRef(false);

  // Monitor scroll position so we only auto-scroll if user is near bottom
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    userScrolledUpRef.current = distanceToBottom > 120;
  };

  useEffect(() => {
    if (!userScrolledUpRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSearching, isStreaming]);

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      {/* Top bar for conversation actions */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-rule shrink-0 text-xs font-sans text-ink-soft">
        <span className="font-medium text-ink">Conversation</span>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={onClearConversation}
            className="text-ink-soft hover:text-ink transition-colors cursor-pointer select-none"
          >
            New conversation
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        aria-live="polite"
        className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col gap-6 py-6 text-sm text-ink-soft">
            <p className="font-sans leading-relaxed text-ink-soft">
              Ask anything about the video. Answers reference the transcript with timestamps you can click to jump straight to that moment.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <span className="text-xs font-medium text-ink">Suggested questions</span>
              <button
                type="button"
                onClick={() => onStarterPrompt('Summarize the main topics discussed in this video.')}
                className="text-left font-sans text-sm text-fathom hover:underline py-1 cursor-pointer select-none"
              >
                Summarize the main topics discussed in this video.
              </button>
              <button
                type="button"
                onClick={() => onStarterPrompt('What is discussed at the start of the video?')}
                className="text-left font-sans text-sm text-fathom hover:underline py-1 cursor-pointer select-none"
              >
                What is discussed at the start of the video?
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const isLatestAssistant = !isUser && index === messages.length - 1;

            return (
              <div
                key={msg.id || `msg-${index}`}
                className="pt-4 first:pt-1 pb-4 border-b border-rule last:border-b-0 flex flex-col gap-2.5"
              >
                {isUser ? (
                  <h3 className="font-sans text-[16px] font-semibold text-ink leading-snug">
                    {msg.content}
                  </h3>
                ) : (
                  <Answer
                    content={msg.content}
                    onSeek={onSeek}
                    isStreaming={isLatestAssistant && isStreaming}
                  />
                )}
              </div>
            );
          })
        )}

        {/* Searching indicator: ring pulses outward from a small dot */}
        {isSearching && (
          <div className="flex items-center gap-2.5 py-4 text-sm font-sans text-ink-soft">
            <EchoRings variant="pulse" size={20} />
            <span>Searching the video…</span>
          </div>
        )}

        {/* Error state with retry action */}
        {hasError && (
          <div className="p-3.5 rounded-[6px] border border-danger/40 bg-danger/5 flex items-center justify-between gap-3 text-xs font-sans text-danger">
            <span>That didn&apos;t go through. Check your connection and try again.</span>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 font-medium underline hover:opacity-80 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Pinned composer */}
      <div className="pt-3 shrink-0">
        <Composer
          input={input}
          setInput={setInput}
          onSubmit={onSubmit}
          onStop={onStop}
          isStreaming={isStreaming}
          isSearching={isSearching}
        />
      </div>
    </div>
  );
}
