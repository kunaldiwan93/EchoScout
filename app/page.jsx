'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Sparkles, Video, BookOpen, ArrowRight } from 'lucide-react';
import { extractVideoId } from '../lib/utils';
import VideoIngestor from '../components/VideoIngestor';
import YouTubeViewer from '../components/YouTubeViewer';
import ChatPanel from '../components/ChatPanel';

export default function Home() {
  const [youtubeUrl, setYoutubeUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [activeVideoId, setActiveVideoId] = useState('dQw4w9WgXcQ');
  const [startTime, setStartTime] = useState(0);
  const [ingestStatus, setIngestStatus] = useState({ state: 'idle', message: '', chunks: 0 });

  const iframeRef = useRef(null);

  const handleIngest = async (e) => {
    e?.preventDefault();
    if (!youtubeUrl.trim()) return;

    const extractedId = extractVideoId(youtubeUrl);
    if (!extractedId) {
      setIngestStatus({
        state: 'error',
        message: 'Invalid YouTube URL or Video ID. Please check the link.',
        chunks: 0,
      });
      return;
    }

    setIngestStatus({ state: 'loading', message: 'Fetching transcript & generating embeddings...', chunks: 0 });
    setActiveVideoId(extractedId);
    setStartTime(0);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to ingest video');
      }

      setIngestStatus({
        state: 'success',
        message: data.chunkCount > 0 ? `Ingested ${data.chunkCount} vector chunks successfully!` : data.message,
        chunks: data.chunkCount,
      });
    } catch (err) {
      setIngestStatus({
        state: 'error',
        message: err.message || 'Error ingesting video.',
        chunks: 0,
      });
    }
  };

  const handleSeekTo = (seconds) => {
    setStartTime(seconds);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [seconds, true],
          }),
          '*'
        );
      } catch (err) {
        console.log('Seek postMessage error:', err);
      }
    }
  };



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
              EchoScout <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">Video RAG</span>
            </h1>
          </div>
        </div>

        {activeVideoId && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/50">
            <Video className="w-3.5 h-3.5 text-cyan-400" />
            <span>Active Video ID:</span>
            <code className="font-mono text-cyan-300 font-semibold">{activeVideoId}</code>
          </div>
        )}
      </header>

      {/* Main Split-Screen Container */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800/80 overflow-hidden">
        {/* Left Half: Video Player & Ingestion */}
        <section className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-4rem)]">
          
          <VideoIngestor 
            youtubeUrl={youtubeUrl} 
            setYoutubeUrl={setYoutubeUrl} 
            handleIngest={handleIngest} 
            ingestStatus={ingestStatus} 
          />

          <YouTubeViewer 
            activeVideoId={activeVideoId} 
            startTime={startTime} 
            iframeRef={iframeRef} 
          />


        </section>

        {/* Right Half: AI RAG Chat Interface */}
        <ChatPanel 
          activeVideoId={activeVideoId}
          onSeek={handleSeekTo} 
        />
      </main>
    </div>
  );
}
