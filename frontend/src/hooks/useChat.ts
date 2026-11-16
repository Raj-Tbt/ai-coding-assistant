import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Message } from '../types/chat';
import { conversationService } from '../services/conversations';
import { streamChat } from '../services/chat';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const queryClient = useQueryClient();

  const loadMessages = useCallback(async (conversationId: string) => {
    setError(null);
    try {
      const msgs = await conversationService.getMessages(conversationId);
      setMessages(msgs);
    } catch {
      setError('Failed to load messages.');
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      conversationId: string | null,
      onNewConversation?: (id: string) => void
    ) => {
      setError(null);
      setIsStreaming(true);

      const tempUserMsg: Message = {
        id: `temp-user-${Date.now()}`,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      };

      const tempId = `temp-asst-${Date.now()}`;
      const tempAssistantMsg: Message = {
        id: tempId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, tempUserMsg, tempAssistantMsg]);

      const ac = new AbortController();
      setAbortController(ac);

      // Track the resolved conversation ID — may differ from the arg for new chats
      let resolvedConvId: string | null = conversationId;

      try {
        await streamChat(
          { conversation_id: conversationId, message: content },
          (event) => {
            if (event.type === 'start' && event.conversation_id) {
              resolvedConvId = event.conversation_id;
              if (!conversationId) {
                onNewConversation?.(event.conversation_id);
              }
            } else if (event.type === 'chunk' && event.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId ? { ...m, content: m.content + event.content } : m
                )
              );
            } else if (event.type === 'done') {
              setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? { ...m, isStreaming: false } : m))
              );
              queryClient.invalidateQueries({ queryKey: ['conversations'] });
              // Swap temp messages for real persisted records once stream completes
              if (resolvedConvId) {
                conversationService.getMessages(resolvedConvId).then((msgs) => {
                  setMessages(msgs);
                }).catch(() => {/* keep optimistic messages if fetch fails */});
              }
            } else if (event.type === 'error') {
              throw new Error(event.error || 'AI response error');
            }
          },
          ac.signal
        );
      } catch (err: unknown) {
        if ((err as { name?: string }).name === 'AbortError') return;
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError('Something went wrong. Please try again.');
      } finally {
        setIsStreaming(false);
        setAbortController(null);
      }
    },
    [queryClient]
  );

  const regenerate = useCallback(
    async (conversationId: string) => {
      const userMessages = messages.filter((m) => m.role === 'user');
      if (!userMessages.length) return;
      const lastUserMsg = userMessages[userMessages.length - 1];

      // Remove last assistant message from UI
      setMessages((prev) => {
        const idx = [...prev].reverse().findIndex((m) => m.role === 'assistant');
        if (idx === -1) return prev;
        const realIdx = prev.length - 1 - idx;
        return prev.filter((_, i) => i !== realIdx);
      });

      setError(null);
      setIsStreaming(true);

      const tempId = `temp-regen-${Date.now()}`;
      const tempAssistantMsg: Message = {
        id: tempId,
        role: 'assistant',
        content: '',
        created_at: new Date().toISOString(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, tempAssistantMsg]);

      const ac = new AbortController();
      setAbortController(ac);

      try {
        await streamChat(
          { conversation_id: conversationId, message: lastUserMsg.content, regenerate: true },
          (event) => {
            if (event.type === 'chunk' && event.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === tempId ? { ...m, content: m.content + event.content } : m
                )
              );
            } else if (event.type === 'done') {
              setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? { ...m, isStreaming: false } : m))
              );
            } else if (event.type === 'error') {
              throw new Error(event.error || 'AI response error');
            }
          },
          ac.signal
        );
      } catch (err: unknown) {
        if ((err as { name?: string }).name === 'AbortError') return;
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError('Regeneration failed. Please try again.');
      } finally {
        setIsStreaming(false);
        setAbortController(null);
      }
    },
    [messages]
  );

  const stopStreaming = useCallback(() => {
    abortController?.abort();
  }, [abortController]);

  return { messages, isStreaming, error, loadMessages, clearMessages, sendMessage, regenerate, stopStreaming };
}
