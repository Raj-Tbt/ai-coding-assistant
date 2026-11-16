import { useState, useEffect, useRef, memo } from 'react';
import { Copy, Check } from 'lucide-react';
import hljs from 'highlight.js';

interface CodeBlockProps {
  language?: string;
  children: string;
}

// memo so CodeBlock only re-renders when language or children actually change
export const CodeBlock = memo(function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!codeRef.current) return;
    if (language && hljs.getLanguage(language)) {
      codeRef.current.innerHTML = hljs.highlight(children, { language }).value;
    } else {
      codeRef.current.innerHTML = hljs.highlightAuto(children).value;
    }
  }, [children, language]);

  const copy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-neutral-700 bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
        <span className="text-xs font-mono text-neutral-400">{language || 'code'}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed m-0">
        <code ref={codeRef} className={language ? `language-${language} hljs` : 'hljs'} />
      </pre>
    </div>
  );
});
