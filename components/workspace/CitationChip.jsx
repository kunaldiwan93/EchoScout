'use client';

export default function CitationChip({
  timestamp,
  seconds,
  onSeek,
  className = '',
}) {
  const cleanLabel = (timestamp || '').replace(/[\[\]]/g, '').trim();

  const handleClick = (e) => {
    e.preventDefault();
    if (typeof onSeek === 'function') {
      onSeek(seconds);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Jump to ${cleanLabel}`}
      title={`Jump video to ${cleanLabel}`}
      className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 mx-0.5 font-mono text-[13px] font-medium rounded-[2px] bg-buoy text-ink hover:brightness-95 active:scale-[0.98] transition-all cursor-pointer align-baseline select-none focus-visible:outline-2 focus-visible:outline-buoy focus-visible:outline-offset-2 ${className}`}
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
      </svg>
      <span>{cleanLabel}</span>
    </button>
  );
}
