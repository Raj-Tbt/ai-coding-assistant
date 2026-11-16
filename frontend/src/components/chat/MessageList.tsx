import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Message } from '../../types/chat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  userName: string;
  isStreaming: boolean;
  onRegenerate: () => void;
}

const SCROLL_THRESHOLD = 120; // px from bottom — within this, we auto-scroll

export function MessageList({ messages, userName, isStreaming, onRegenerate }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  // Whether the user has manually scrolled away from the bottom
  const userScrolledUpRef = useRef(false);
  const rafRef = useRef<number>(0);

  const isNearBottom = useCallback(() => {
    const el = containerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  // Detect manual scroll — if user scrolls up, stop auto-scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      const nearBottom = isNearBottom();
      // Update "user scrolled up" flag
      userScrolledUpRef.current = !nearBottom;
      setShowScrollBtn(!nearBottom);
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [isNearBottom]);

  // Auto-scroll only when near bottom and new content arrives
  useEffect(() => {
    if (!isStreaming) return;
    if (userScrolledUpRef.current) return; // respect user's scroll position

    // Debounce via rAF to avoid scroll-fighting on rapid chunk updates
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      scrollToBottom('instant'); // 'instant' avoids animation lag during streaming
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [messages, isStreaming, scrollToBottom]);

  // When streaming ends, scroll to bottom smoothly if near bottom
  useEffect(() => {
    if (isStreaming) return;
    userScrolledUpRef.current = false;
    if (isNearBottom()) scrollToBottom('smooth');
  }, [isStreaming, isNearBottom, scrollToBottom]);

  // Loading skeletons when no messages
  if (!messages.length) {
    return (
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-neutral-700 shrink-0 mt-1" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-3/4" />
                <div className="h-3 bg-gray-200 dark:bg-neutral-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-6 relative scroll-smooth">
      <div className="max-w-3xl mx-auto space-y-5">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            userName={userName}
            isLast={idx === messages.length - 1}
            onRegenerate={!isStreaming ? onRegenerate : undefined}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {showScrollBtn && (
        <button
          onClick={() => {
            userScrolledUpRef.current = false;
            scrollToBottom('smooth');
          }}
          className="fixed bottom-24 right-6 p-2 rounded-full bg-white dark:bg-neutral-800 shadow-md border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors z-10"
        >
          <ChevronDown size={18} className="text-gray-600 dark:text-gray-300" />
        </button>
      )}
    </div>
  );
}
