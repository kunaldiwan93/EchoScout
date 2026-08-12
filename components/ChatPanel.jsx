import { Send, Loader2, MessageSquare, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { useState, useRef, useEffect } from 'react';

export default function ChatPanel({
  activeVideoId,
  onSeek
}) {
  const chatBottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  const handleInputChange = (e) => setInput(e.target.value);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;
    
    const userMessage = { id: Date.now().toString(), role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setIsChatLoading(true);

    const botMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: botMessageId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage], 
          videoId: activeVideoId 
        }),
      });

      if (!res.ok) throw new Error('Failed to fetch chat response');

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          // Note: Assuming the backend returns raw text stream now.
          // If Vercel protocol 0:"..." is present, we blindly append it until the backend is updated.
          const cleanChunk = chunk.replace(/^0:"(.*)"\n$/g, '$1').replace(/\\n/g, '\n');
          
          setMessages((prev) => prev.map((msg) => 
            msg.id === botMessageId ? { ...msg, content: msg.content + chunk } : msg
          ));
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Sorry, an error occurred.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(input);
    setInput('');
  };

  const handleSamplePrompt = (text) => { 
    sendMessage(text); 
  };

  return (
    <section className="p-6 flex flex-col h-[calc(100vh-4rem)] bg-slate-950/50">
      {/* Chat Header */}
      <div className="pb-4 mb-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <h2 className="font-semibold text-slate-200 text-sm">Transcript RAG Assistant</h2>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Gemini 768d Vector Search</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8 text-slate-500">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-300 text-base mb-1">Ask questions about the video</h3>
              <p className="text-xs max-w-sm leading-relaxed text-slate-400">
                Once indexed, ask anything about the video content. The assistant will search vector embeddings and cite clickable timestamps like <span className="text-cyan-400 font-mono">[01:23]</span> to jump directly to that part of the video!
              </p>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <ChatMessage key={m.id} message={m} onSeek={onSeek} />
          ))
        )}

        {isChatLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Searching vector embeddings & generating response...</span>
            </div>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Quick Guidance / Sample Suggestions */}
      {messages.length === 0 && (
        <div className="bg-slate-900/50 rounded-2xl border border-slate-800/80 p-4 flex flex-col gap-3 mt-4 shrink-0">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" /> Suggested Prompts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={() => handleSamplePrompt('Summarize the main topics discussed in this video.')}
              className="text-left text-xs p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-all flex items-start gap-2 group cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5" />
              <span>Summarize the main topics discussed in this video.</span>
            </button>
            <button
              onClick={() => handleSamplePrompt('What is discussed at the start of the video?')}
              className="text-left text-xs p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-all flex items-start gap-2 group cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5" />
              <span>What is discussed at the start of the video?</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-slate-800/80 shrink-0 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question about the video transcript..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
        />
        <button
          type="submit"
          disabled={isChatLoading || !input?.trim()}
          className="px-5 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
}
