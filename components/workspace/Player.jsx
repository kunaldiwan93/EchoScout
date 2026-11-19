'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

export default function Player({
  activeVideoId,
  iframeRef,
  onDurationObtained,
  className = '',
}) {
  const [videoTitle, setVideoTitle] = useState('');

  // Fetch title best-effort via YouTube oEmbed
  useEffect(() => {
    if (!activeVideoId) {
      setVideoTitle('');
      return;
    }

    let isMounted = true;
    const fetchTitle = async () => {
      try {
        const res = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${activeVideoId}&format=json`
        );
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.title) {
            setVideoTitle(data.title);
          }
        }
      } catch (err) {
        // Silently fail on CORS or network error as specified
      }
    };

    fetchTitle();
    return () => {
      isMounted = false;
    };
  }, [activeVideoId]);

  // Listen to postMessage for video duration
  useEffect(() => {
    if (!activeVideoId) return;

    const handleMessage = (e) => {
      try {
        const payload = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (payload?.event === 'infoDelivery' && payload?.info?.duration) {
          if (typeof onDurationObtained === 'function') {
            onDurationObtained(payload.info.duration);
          }
        }
      } catch (err) {}
    };

    window.addEventListener('message', handleMessage);

    // Prompt the iframe to start emitting events
    const timer = setTimeout(() => {
      if (iframeRef?.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'listening' }),
            '*'
          );
        } catch (err) {}
      }
    }, 1200);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [activeVideoId, iframeRef, onDurationObtained]);

  if (!activeVideoId) return null;

  return (
    <div className={`flex flex-col gap-2.5 ${className}`}>
      <div className="relative w-full aspect-video rounded-[12px] overflow-hidden bg-[#0A1A23] border border-rule">
        <iframe
          ref={iframeRef}
          key={activeVideoId}
          src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1`}
          title="YouTube Video Player"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="flex items-start justify-between gap-4 text-xs font-sans text-ink-soft">
        <div className="flex-1 min-w-0">
          {videoTitle ? (
            <p className="font-medium text-ink truncate text-sm" title={videoTitle}>
              {videoTitle}
            </p>
          ) : (
            <p className="font-mono text-xs text-ink-soft">ID: {activeVideoId}</p>
          )}
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${activeVideoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-fathom hover:underline shrink-0 font-medium"
        >
          <span>Open on YouTube</span>
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
}
