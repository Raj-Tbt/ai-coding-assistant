import type { Message } from '../../types/chat';
import { WelcomeScreen } from './WelcomeScreen';
import { MessageList } from './MessageList';
import { MessageComposer } from './MessageComposer';

interface ChatAreaProps {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  userName: string;
  conversationId: string | null;
  onSend: (message: string) => void;
  onStop: () => void;
  onRegenerate: () => void;
}

export function ChatArea({
  messages,
  isStreaming,
  error,
  onSend,
  onStop,
  onRegenerate,
  userName,
}: ChatAreaProps) {
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-950">
      {hasMessages ? (
        <MessageList
          messages={messages}
          userName={userName}
          isStreaming={isStreaming}
          onRegenerate={onRegenerate}
        />
      ) : (
        <WelcomeScreen onPromptSelect={onSend} />
      )}

      {error && (
        <div className="px-4 pb-2">
          <div className="max-w-3xl mx-auto px-4 py-2.5 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
            {error}
          </div>
        </div>
      )}

      <MessageComposer onSend={onSend} onStop={onStop} isStreaming={isStreaming} />
    </div>
  );
}
