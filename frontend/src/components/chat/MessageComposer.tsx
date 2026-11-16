import { useRef, useState, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowUp, Square } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MessageComposerProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function MessageComposer({ onSend, onStop, isStreaming, disabled }: MessageComposerProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    onSend(trimmed);
    textareaRef.current?.focus();
  }, [input, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = input.trim().length > 0 && !isStreaming;

  return (
    <div className="px-4 py-4 border-t border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-2xl px-4 py-3 focus-within:border-blue-400 dark:focus-within:border-blue-500 transition-colors shadow-sm">
          <TextareaAutosize
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about code..."
            minRows={1}
            maxRows={8}
            className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none leading-relaxed"
            disabled={disabled}
          />

          {/* Send / Stop button */}
          {isStreaming ? (
            <button
              onClick={onStop}
              className="shrink-0 w-8 h-8 rounded-lg bg-gray-200 dark:bg-neutral-700 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-neutral-600 transition-colors"
              title="Stop generation"
            >
              <Square size={14} className="text-gray-700 dark:text-gray-300 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                canSend
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 dark:bg-neutral-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              )}
              title="Send message (Enter)"
            >
              <ArrowUp size={16} />
            </button>
          )}
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-2">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
