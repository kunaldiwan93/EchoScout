import { Sparkles } from 'lucide-react';
import { parseTimestamps } from '../lib/utils';

export default function ChatMessage({ message, onSeek }) {
  const content =
    typeof message.content === 'string'
      ? message.content
      : Array.isArray(message.parts)
      ? message.parts.map((p) => p.text || '').join('')
      : '';

  return (
    <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          message.role === 'user'
            ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-br-none'
            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-md'
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400">
          {message.role === 'user' ? (
            <span className="font-medium text-cyan-200">You</span>
          ) : (
            <span className="font-semibold text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> EchoScout AI
            </span>
          )}
        </div>
        <div className="whitespace-pre-wrap">
          {message.role === 'assistant' ? parseTimestamps(content, onSeek) : content}
        </div>
      </div>
    </div>
  );
}
