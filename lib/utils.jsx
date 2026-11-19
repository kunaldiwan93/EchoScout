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

export function parseTimestampToSeconds(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.replace(/[\[\]]/g, '').trim();
  const parts = clean.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 2) {
    return (parts[0] || 0) * 60 + (parts[1] || 0);
  }
  if (parts.length === 3) {
    return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
  }
  return 0;
}

export function formatTimestamp(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function prepareAnswerMarkdown(text) {
  if (!text) return '';
  const parts = text.split(/(```[\s\S]*?```|`[^`\n]*?`)/g);
  return parts
    .map((part) => {
      if (part.startsWith('`')) {
        return part;
      }
      return part.replace(/\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g, (match, timeStr) => {
        const seconds = parseTimestampToSeconds(timeStr);
        return `[${timeStr}](echo-seek:${seconds})`;
      });
    })
    .join('');
}

export function extractAllTimestamps(text) {
  if (!text) return [];
  const parts = text.split(/(```[\s\S]*?```|`[^`\n]*?`)/g);
  const found = new Map();
  for (const part of parts) {
    if (part.startsWith('`')) continue;
    const regex = /\[(\d{1,2}:\d{2}(?::\d{2})?)\]/g;
    let match;
    while ((match = regex.exec(part)) !== null) {
      const timeStr = match[1];
      const seconds = parseTimestampToSeconds(timeStr);
      if (!found.has(seconds)) {
        found.set(seconds, timeStr);
      }
    }
  }
  return Array.from(found.entries())
    .map(([seconds, label]) => ({ seconds, label }))
    .sort((a, b) => a.seconds - b.seconds);
}
