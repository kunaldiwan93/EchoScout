'use client';

import { useState } from 'react';
import hljs from 'highlight.js';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ language, code, className = '' }) {
  const [copied, setCopied] = useState(false);

  const cleanCode = (code || '').replace(/\n$/, '');

  let highlightedHtml = '';
  try {
    if (language && hljs.getLanguage(language)) {
      highlightedHtml = hljs.highlight(cleanCode, { language, ignoreIllegals: true }).value;
    } else {
      highlightedHtml = hljs.highlightAuto(cleanCode).value;
    }
  } catch (e) {
    highlightedHtml = cleanCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Failed to copy code', e);
    }
  };

  return (
    <div className={`my-4 rounded-[6px] overflow-hidden code-block-surface border border-[#1F3A48] ${className}`}>
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-[#1F3A48]/80 text-[11px] font-mono text-[#9DB4BF]">
        <span className="uppercase tracking-wider">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] hover:text-[#DCE8EC] hover:bg-[#112632] transition-colors cursor-pointer"
          aria-label={copied ? 'Code copied' : 'Copy code to clipboard'}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-[#8FC7B4]" strokeWidth={1.5} />
              <span className="text-[#8FC7B4]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" strokeWidth={1.5} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-[14px] leading-relaxed font-mono">
        <pre className="m-0 p-0 font-mono">
          <code
            className="font-mono"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>
    </div>
  );
}
