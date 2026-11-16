import { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Copy, Check, RefreshCw, Bot } from 'lucide-react';
import type { Message } from '../../types/chat';
import { CodeBlock } from './CodeBlock';
import { StreamingIndicator } from './StreamingIndicator';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';
import type { Components } from 'react-markdown';
import type { Element } from 'hast';

interface MessageBubbleProps {
  message: Message;
  userName: string;
  isLast: boolean;
  onRegenerate?: () => void;
}

// Extract plain text from a hast element's children recursively
function extractText(node: Element): string {
  return (node.children ?? [])
    .map((child) => {
      if (child.type === 'text') return child.value;
      if (child.type === 'element') return extractText(child as Element);
      return '';
    })
    .join('');
}

export const MessageBubble = memo(function MessageBubble({ message, userName, isLast, onRegenerate }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyResponse = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // react-markdown v10 — override `pre` for fenced code blocks.
  // The `code` renderer fires for both inline and block code; use `pre` to
  // reliably capture only fenced blocks with their language class.
  const components: Components = {
    pre({ node, children }) {
      // Find the inner <code> element in the hast node
      const codeEl = node?.children?.find(
        (c) => c.type === 'element' && (c as Element).tagName === 'code'
      ) as Element | undefined;

      const className = (codeEl?.properties?.className as string[] | undefined)?.[0] ?? '';
      const langMatch = /language-(\w+)/.exec(className);
      const language = langMatch?.[1];
      const code = codeEl ? extractText(codeEl) : '';

      if (code) {
        return <CodeBlock language={language}>{code}</CodeBlock>;
      }
      // Fallback for pre blocks without a language class
      return <pre className="overflow-x-auto rounded-lg bg-neutral-900 p-4 text-sm">{children}</pre>;
    },
    code({ node, className, children }) {
      // Inline code — only rendered when NOT inside a <pre>
      // (block code is fully handled by the `pre` override above)
      const isInline = node?.position !== undefined &&
        !String(className ?? '').startsWith('language-');
      void isInline; // used for type narrowing only
      return (
        <code className="bg-neutral-800 text-blue-300 rounded px-1 py-0.5 text-[0.85em] font-mono">
          {children}
        </code>
      );
    },
  };

  return (
    <div className={cn('message-enter flex gap-3 group', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      {isUser ? (
        <Avatar name={userName} size="sm" className="mt-1 shrink-0" />
      ) : (
        <div className="w-7 h-7 mt-1 rounded-full bg-neutral-800 dark:bg-neutral-700 flex items-center justify-center shrink-0">
          <Bot size={14} className="text-blue-400" />
        </div>
      )}

      <div className={cn('flex flex-col gap-1 max-w-[85%]', isUser ? 'items-end' : 'items-start')}>
        {/* Bubble */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-gray-100 dark:bg-neutral-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : message.isStreaming && !message.content ? (
            <StreamingIndicator />
          ) : (
            <div className="prose-chat">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={components}
              >
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && <StreamingIndicator />}
            </div>
          )}
        </div>

        {/* Action buttons — shown for assistant messages on hover */}
        {!isUser && !message.isStreaming && message.content && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={copyResponse}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {isLast && onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <RefreshCw size={12} />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
