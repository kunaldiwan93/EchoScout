import { YoutubeIcon } from './VideoIngestor'; // Reuse the icon

export default function YouTubeViewer({ activeVideoId, startTime, iframeRef }) {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl group">
      {activeVideoId ? (
        <iframe
          ref={iframeRef}
          key={`${activeVideoId}-${startTime}`}
          src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1&start=${startTime}`}
          title="YouTube Video Player"
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-500 p-6 text-center">
          <YoutubeIcon className="w-12 h-12 text-slate-700" />
          <p className="text-sm">Enter a YouTube URL above to start video indexing and playback.</p>
        </div>
      )}
    </div>
  );
}
