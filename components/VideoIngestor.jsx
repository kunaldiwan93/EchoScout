import { Loader2, Zap, CheckCircle2, AlertCircle } from 'lucide-react';

export function YoutubeIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

export default function VideoIngestor({ youtubeUrl, setYoutubeUrl, handleIngest, ingestStatus }) {
  const handleYoutubeUrlChange = (e) => {
    setYoutubeUrl(e.target.value);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col gap-3 backdrop-blur-sm">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <YoutubeIcon className="w-4 h-4 text-red-500" /> Load & Index YouTube Video
      </label>
      <form onSubmit={handleIngest} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={youtubeUrl}
            onChange={handleYoutubeUrlChange}
            placeholder="Paste YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={ingestStatus.state === 'loading'}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {ingestStatus.state === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Indexing...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Index Video</span>
            </>
          )}
        </button>
      </form>

      {/* Status Alert Banner */}
      {ingestStatus.state !== 'idle' && (
        <div
          className={`text-xs px-3.5 py-2.5 rounded-xl border flex items-center gap-2 transition-all ${
            ingestStatus.state === 'loading'
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              : ingestStatus.state === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          {ingestStatus.state === 'loading' && <Loader2 className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />}
          {ingestStatus.state === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {ingestStatus.state === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span className="flex-1">{ingestStatus.message}</span>
        </div>
      )}
    </div>
  );
}
