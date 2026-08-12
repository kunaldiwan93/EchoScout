import { Play } from 'lucide-react';

export function extractVideoId(urlOrId) {
  if (!urlOrId) return null;
  
  try {
    const url = new URL(urlOrId);
    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/live/')) {
        const v = url.pathname.replace('/live/', '').split('?')[0];
        return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
      }
      if (url.pathname.startsWith('/shorts/')) {
        const v = url.pathname.replace('/shorts/', '').split('?')[0];
        return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
      }
      const v = url.searchParams.get('v');
      return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
    }
    if (url.hostname === 'youtu.be') {
      const v = url.pathname.slice(1).split('?')[0];
      return v && /^[a-zA-Z0-9_-]{11}$/.test(v) ? v : null;
    }
  } catch (e) {
    // If not a valid URL, check if it's already an 11-char ID
    const str = urlOrId.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
      return str;
    }
    // Fallback regex for unstructured text
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|live|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = str.match(regExp);
    return match ? match[1] : null;
  }
  return null;
}

export function parseTimestamps(text, onSeek) {
  if (!text) return null;

  const regex = /\[(\d{1,2}):(\d{2})\]|\[(\d{1,2}):(\d{2}):(\d{2})\]/g;
  const elements = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];
    let totalSeconds = 0;

    if (match[1] !== undefined && match[2] !== undefined) {
      const mins = parseInt(match[1], 10);
      const secs = parseInt(match[2], 10);
      totalSeconds = mins * 60 + secs;
    } else if (match[3] !== undefined && match[4] !== undefined && match[5] !== undefined) {
      const hrs = parseInt(match[3], 10);
      const mins = parseInt(match[4], 10);
      const secs = parseInt(match[5], 10);
      totalSeconds = hrs * 3600 + mins * 60 + secs;
    }

    const targetSeconds = totalSeconds;
    elements.push(
      <button
        key={`timestamp-${match.index}`}
        onClick={() => onSeek(targetSeconds)}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 my-0.5 mx-1 text-xs font-semibold text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/35 border border-cyan-400/40 rounded-full transition-all duration-200 shadow-sm hover:scale-105 active:scale-95 cursor-pointer group"
        title={`Jump video to ${fullMatch}`}
      >
        <Play className="w-3 h-3 text-cyan-400 fill-cyan-400 group-hover:scale-110 transition-transform" />
        <span>{fullMatch}</span>
      </button>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
}
