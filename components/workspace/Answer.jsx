'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CitationChip from './CitationChip';
import CodeBlock from './CodeBlock';
import { prepareAnswerMarkdown, parseTimestampToSeconds } from '../../lib/utils';
import { Copy, Check } from 'lucide-react';

export default function Answer({
  content,
  onSeek,
  isStreaming = false,
  className = '',
}) {
  const [copied, setCopied] = useState(false);

  const processedMarkdown = prepareAnswerMarkdown(content || '');

  const handleCopyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Failed to copy answer', e);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="font-serif text-[18px] leading-[1.65] text-ink max-w-[68ch] break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          urlTransform={(url) => url}
          components={{
            p({ children }) {
              return <p className="mb-3.5 last:mb-0">{children}</p>;
            },
            a({ href, children }) {
              if (href && href.startsWith('echo-seek:')) {
                const secStr = href.replace('echo-seek:', '');
                const seconds = parseInt(secStr, 10) || 0;
                const label = Array.isArray(children)
                  ? children.join('')
                  : typeof children === 'string'
                  ? children
                  : '';
                return (
                  <CitationChip
                    timestamp={label}
                    seconds={seconds}
                    onSeek={onSeek}
                  />
                );
              }
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fathom underline underline-offset-2 hover:opacity-80"
                >
                  {children}
                </a>
              );
            },
            code({ node, inline, className: codeClass, children, ...props }) {
              const match = /language-(\w+)/.exec(codeClass || '');
              const codeText = String(children).replace(/\n$/, '');
              // If it's a block code
              if (!inline && (match || String(children).includes('\n'))) {
                return (
                  <CodeBlock
                    language={match ? match[1] : ''}
                    code={codeText}
                  />
                );
              }
              // Inline code: Plex Mono on a --sheet tint with a 1px --rule border
              return (
                <code
                  className="font-mono text-[14px] bg-sheet border border-rule px-1.5 py-0.5 rounded-[2px] text-ink mx-0.5"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            ul({ children }) {
              return <ul className="list-disc pl-5 my-3 space-y-1">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal pl-5 my-3 space-y-1">{children}</ol>;
            },
            li({ children }) {
              return <li className="pl-1">{children}</li>;
            },
            blockquote({ children }) {
              return (
                <blockquote className="border-l-2 border-rule pl-4 my-3 text-ink-soft italic">
                  {children}
                </blockquote>
              );
            },
          }}
        >
          {processedMarkdown}
        </ReactMarkdown>
      </div>

      {!isStreaming && content && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleCopyAnswer}
            className="inline-flex items-center gap-1.5 text-xs font-sans text-ink-soft hover:text-ink transition-colors cursor-pointer select-none"
            aria-label={copied ? 'Answer copied' : 'Copy answer text'}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-buoy" strokeWidth={1.5} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Copy answer</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
