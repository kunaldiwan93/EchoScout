'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import WorkspaceHeader from '../../components/workspace/WorkspaceHeader';
import Player from '../../components/workspace/Player';
import EchoTimeline from '../../components/workspace/EchoTimeline';
import Conversation from '../../components/workspace/Conversation';
import LinkBar from '../../components/workspace/LinkBar';
import { extractVideoId, extractAllTimestamps } from '../../lib/utils';

export default function WorkspacePage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [activeSeconds, setActiveSeconds] = useState(null);
  const [newestSeconds, setNewestSeconds] = useState(null);

  // Ingestion status: 'idle' | 'loading' | 'success' | 'error'
  const [ingestStatus, setIngestStatus] = useState({
    state: 'idle',
    message: '',
    sections: 0,
  });

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasError, setHasError] = useState(false);

  const iframeRef = useRef(null);
  const abortControllerRef = useRef(null);
  const prevTimestampsCountRef = useRef(0);

  // Ingest video
  const handleAddVideo = async (overrideUrl) => {
    const targetUrl = (overrideUrl || youtubeUrl).trim();
    if (!targetUrl) return;

    const extractedId = extractVideoId(targetUrl);
    if (!extractedId) {
      setIngestStatus({
        state: 'error',
        message: "That doesn't look like a YouTube link. Paste the full link or the video ID.",
        sections: 0,
      });
      return;
    }

    setIngestStatus({
      state: 'loading',
      message: 'Reading captions and indexing…',
      sections: 0,
    });

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ youtubeUrl: targetUrl }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let msg = data.error || 'Failed to add video.';
        if (res.status === 404 || msg.includes('No transcript found')) {
          msg = 'No transcript found for this video. This video may not have captions.';
        } else if (msg.includes('Database check failed') || msg.includes('fetch failed')) {
          msg = 'Database connection failed. Your Supabase project may be paused or unreachable. Check your Supabase dashboard to restore it.';
        }
        setIngestStatus({
          state: 'error',
          message: msg,
          sections: 0,
        });
        return;
      }

      // Success
      setActiveVideoId(extractedId);
      setMessages([]);
      setInput('');
      setVideoDuration(0);

      const sectionCount = data.chunkCount || 0;
      const successMessage =
        sectionCount > 0
          ? `Ready. ${sectionCount} sections added.`
          : 'Already added. Ready for questions.';

      setIngestStatus({
        state: 'success',
        message: successMessage,
        sections: sectionCount,
      });
    } catch (err) {
      setIngestStatus({
        state: 'error',
        message: 'Could not connect. Check your network and try again.',
        sections: 0,
      });
    }
  };

  // Video seeking via YouTube API postMessage
  const handleSeekTo = (seconds) => {
    setActiveSeconds(seconds);
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
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'playVideo',
            args: [],
          }),
          '*'
        );
      } catch (err) {
        console.error('Seek error:', err);
      }
    }
  };

  // Chat messaging
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isStreaming || isSearching || !activeVideoId) return;

    setInput('');
    setHasError(false);

    const userMessage = { id: Date.now().toString(), role: 'user', content: query };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setIsSearching(true);

    const botMessageId = (Date.now() + 1).toString();
    const botMessage = { id: botMessageId, role: 'assistant', content: '' };

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages,
          videoId: activeVideoId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error('Chat API returned error');
      }

      setIsSearching(false);
      setIsStreaming(true);
      setMessages((prev) => [...prev, botMessage]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId ? { ...msg, content: msg.content + chunk } : msg
            )
          );
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        // Stream aborted by user
      } else {
        console.error('Chat error:', err);
        setHasError(true);
      }
    } finally {
      setIsSearching(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsSearching(false);
  };

  const handleRetry = () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      const trimmed = messages.slice(0, messages.lastIndexOf(lastUserMsg));
      setMessages(trimmed);
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleClearConversation = () => {
    handleStop();
    setMessages([]);
    setHasError(false);
  };

  // Extract all timestamps cited in assistant messages
  const conversationTimestamps = useMemo(() => {
    const assistantText = messages
      .filter((m) => m.role === 'assistant')
      .map((m) => m.content)
      .join('\n');
    return extractAllTimestamps(assistantText);
  }, [messages]);

  // Pulse when a new timestamp arrives
  useEffect(() => {
    if (conversationTimestamps.length > prevTimestampsCountRef.current) {
      const newest = conversationTimestamps[conversationTimestamps.length - 1];
      if (newest) {
        setNewestSeconds(newest.seconds);
        const timer = setTimeout(() => setNewestSeconds(null), 1600);
        return () => clearTimeout(timer);
      }
    }
    prevTimestampsCountRef.current = conversationTimestamps.length;
  }, [conversationTimestamps]);

  // Phase check
  const isPhaseReady = Boolean(activeVideoId);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col font-sans">
      <WorkspaceHeader
        url={youtubeUrl}
        setUrl={setYoutubeUrl}
        onAddVideo={() => handleAddVideo()}
        status={ingestStatus}
        onResetStatus={() => setIngestStatus({ state: 'idle', message: '', sections: 0 })}
        showLinkBar={isPhaseReady}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col">
        {!isPhaseReady ? (
          /* Phase A & B: Empty workspace / Adding a video */
          <div className="flex-1 flex items-center justify-center p-6 md:p-12">
            <div className="w-full max-w-xl flex flex-col gap-5 text-left">
              <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.035em] text-ink">
                  Add a video to start asking
                </h1>
                <p className="text-sm md:text-base text-ink-soft leading-relaxed">
                  Paste a YouTube link. EchoScout reads its captions so you can ask questions about it.
                </p>
              </div>

              <div className="pt-2">
                <LinkBar
                  url={youtubeUrl}
                  setUrl={setYoutubeUrl}
                  onAddVideo={() => handleAddVideo()}
                  status={ingestStatus}
                  onResetStatus={() => setIngestStatus({ state: 'idle', message: '', sections: 0 })}
                  large
                />
              </div>
            </div>
          </div>
        ) : (
          /* Phase C: Ready - Main Workspace Layout */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-rule max-w-[1720px] w-full mx-auto">
            {/* Left column (~55%): Player & Echo Timeline (Sticky on desktop, sticky on top for mobile) */}
            <section className="lg:col-span-7 p-4 md:p-6 lg:p-8 flex flex-col gap-4 lg:sticky lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:overflow-y-auto shrink-0">
              <Player
                activeVideoId={activeVideoId}
                iframeRef={iframeRef}
                onDurationObtained={(dur) => setVideoDuration(dur)}
              />

              <EchoTimeline
                timestamps={conversationTimestamps}
                duration={videoDuration}
                onSeek={handleSeekTo}
                newestSeconds={newestSeconds}
                activeSeconds={activeSeconds}
              />
            </section>

            {/* Right column (~45%): Document-like Conversation & Composer */}
            <section className="lg:col-span-5 p-4 md:p-6 lg:p-8 flex flex-col h-[calc(100dvh-3.5rem)] min-h-[500px] overflow-hidden bg-paper">
              <Conversation
                messages={messages}
                input={input}
                setInput={setInput}
                onSubmit={() => handleSendMessage()}
                onStop={handleStop}
                onRetry={handleRetry}
                onSeek={handleSeekTo}
                onClearConversation={handleClearConversation}
                isSearching={isSearching}
                isStreaming={isStreaming}
                hasError={hasError}
                onStarterPrompt={(prompt) => handleSendMessage(prompt)}
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
