'use client';

import { Loader2 } from 'lucide-react';
import EchoRings from '../ui/EchoRings';

export default function LinkBar({
  url,
  setUrl,
  onAddVideo,
  status = { state: 'idle', message: '', sections: 0 },
  onResetStatus,
  large = false,
  className = '',
}) {
  const isAdding = status.state === 'loading';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAdding && url.trim()) {
      onAddVideo();
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (status.state !== 'idle' && onResetStatus) {
              onResetStatus();
            }
          }}
          placeholder="Paste a YouTube link"
          disabled={isAdding}
          className={`flex-1 bg-sheet border border-rule text-ink placeholder:text-ink-soft rounded-[6px] font-sans transition-colors focus:border-fathom focus:outline-none ${
            large ? 'px-4 py-3 text-base' : 'px-3 py-1.5 text-sm h-9'
          }`}
        />
        <button
          type="submit"
          disabled={isAdding || !url.trim()}
          className={`inline-flex items-center justify-center font-sans font-medium bg-fathom text-sheet rounded-[6px] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0 select-none ${
            large ? 'px-5 py-3 text-base h-12' : 'px-3.5 py-1.5 text-sm h-9'
          }`}
        >
          {isAdding ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" strokeWidth={1.5} />
              <span>Adding…</span>
            </>
          ) : (
            <span>Add video</span>
          )}
        </button>
      </form>

      {/* Status line */}
      {status.state !== 'idle' && (
        <div className="flex items-center gap-2 text-xs font-sans min-h-[20px]">
          {status.state === 'loading' && (
            <div className="flex items-center gap-1.5 text-ink-soft">
              <EchoRings variant="pulse" size={16} />
              <span>{status.message || 'Reading captions and indexing…'}</span>
            </div>
          )}

          {status.state === 'success' && (
            <span className="text-fathom font-medium">
              {status.message}
            </span>
          )}

          {status.state === 'error' && (
            <div className="flex items-center gap-2 text-danger">
              <span>{status.message}</span>
              {onAddVideo && (
                <button
                  type="button"
                  onClick={onAddVideo}
                  className="underline hover:opacity-80 font-medium cursor-pointer"
                >
                  Try again
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
