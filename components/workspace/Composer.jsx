'use client';

import { useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

export default function Composer({
  input,
  setInput,
  onSubmit,
  onStop,
  isStreaming = false,
  isSearching = false,
  disabled = false,
  className = '',
}) {
  const textareaRef = useRef(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !isStreaming && input.trim()) {
        onSubmit();
      }
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isStreaming) {
          onStop?.();
        } else if (!disabled && input.trim()) {
          onSubmit();
        }
      }}
      className={`relative flex items-end gap-2 p-2.5 bg-sheet border border-rule rounded-[12px] shadow-sm ${className}`}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about this video"
        disabled={disabled}
        className="flex-1 max-h-[180px] bg-transparent text-ink placeholder:text-ink-soft text-sm font-sans resize-none border-0 focus:ring-0 focus:outline-none p-1 leading-relaxed"
      />

      {isStreaming ? (
        <button
          type="button"
          onClick={onStop}
          className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] bg-danger text-sheet hover:opacity-90 transition-opacity cursor-pointer shrink-0 select-none focus-visible:outline-2 focus-visible:outline-buoy focus-visible:outline-offset-2"
          aria-label="Stop generation"
          title="Stop generating answer"
        >
          <Square className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
        </button>
      ) : (
        <button
          type="submit"
          disabled={disabled || !input.trim() || isSearching}
          className="inline-flex items-center justify-center w-8 h-8 rounded-[6px] bg-fathom text-sheet hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 select-none focus-visible:outline-2 focus-visible:outline-buoy focus-visible:outline-offset-2"
          aria-label="Send question"
          title="Send question"
        >
          <ArrowUp className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </form>
  );
}
