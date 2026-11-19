'use client';

import { useState } from 'react';
import EchoRings from '../ui/EchoRings';
import CitationChip from './CitationChip';
import { formatTimestamp } from '../../lib/utils';

export default function EchoTimeline({
  timestamps = [], // Array of { seconds: number, label: string }
  duration = 0, // Video duration in seconds
  onSeek,
  newestSeconds = null,
  activeSeconds = null,
  className = '',
}) {
  const [hoveredMarker, setHoveredMarker] = useState(null);

  if (!timestamps || timestamps.length === 0) {
    return (
      <div className={`py-4 px-3 border border-dashed border-rule rounded-[6px] text-center text-xs font-sans text-ink-soft ${className}`}>
        Moments cited in answers will appear here.
      </div>
    );
  }

  const hasValidDuration = typeof duration === 'number' && duration > 0;

  return (
    <div className={`flex flex-col gap-3 py-2 ${className}`}>
      <div className="flex items-center justify-between text-xs font-sans text-ink-soft">
        <span className="font-medium text-ink">Moments in this conversation</span>
        {hasValidDuration && (
          <span className="font-mono text-[11px] text-ink-soft">
            Length: {formatTimestamp(duration)}
          </span>
        )}
      </div>

      {hasValidDuration ? (
        <div className="relative w-full py-4 select-none">
          {/* Timeline rail */}
          <div className="relative w-full h-[2px] bg-rule rounded-full">
            {/* Start and end tick marks */}
            <div className="absolute left-0 -top-1 w-[2px] h-2.5 bg-rule" />
            <div className="absolute right-0 -top-1 w-[2px] h-2.5 bg-rule" />

            {/* Markers */}
            {timestamps.map((t) => {
              const clampedSeconds = Math.min(Math.max(0, t.seconds), duration);
              const percent = (clampedSeconds / duration) * 100;
              const isHovered = hoveredMarker === t.seconds;
              const isCurrent = activeSeconds === t.seconds;
              const isNewMarker = newestSeconds === t.seconds;

              return (
                <div
                  key={`timeline-marker-${t.seconds}`}
                  style={{ left: `${percent}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                >
                  <button
                    type="button"
                    onClick={() => onSeek(t.seconds)}
                    onMouseEnter={() => setHoveredMarker(t.seconds)}
                    onMouseLeave={() => setHoveredMarker(null)}
                    aria-label={`Jump to ${t.label || formatTimestamp(t.seconds)}`}
                    className="p-1 rounded-full focus-visible:outline-2 focus-visible:outline-buoy focus-visible:outline-offset-2 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  >
                    <EchoRings
                      variant="marker"
                      size={20}
                      active={isHovered || isCurrent}
                      isNew={isNewMarker}
                    />
                  </button>

                  {/* Tooltip on hover */}
                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-0.5 rounded-[2px] bg-ink text-sheet font-mono text-[11px] whitespace-nowrap pointer-events-none transition-opacity ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {t.label || formatTimestamp(t.seconds)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Quick access citation chips row */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        {timestamps.map((t) => (
          <CitationChip
            key={`quick-chip-${t.seconds}`}
            timestamp={t.label || formatTimestamp(t.seconds)}
            seconds={t.seconds}
            onSeek={onSeek}
          />
        ))}
      </div>
    </div>
  );
}
