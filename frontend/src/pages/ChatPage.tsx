import { useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { ChatArea } from '../components/chat/ChatArea';
import { useChat } from '../hooks/useChat';
import { useConversations } from '../hooks/useConversations';
import { useAuth } from '../context/AuthContext';

export function ChatPage() {
  const { id: conversationId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { messages, isStreaming, error, loadMessages, clearMessages, sendMessage, regenerate, stopStreaming } = useChat();
  const { conversations, isLoading, searchQuery, setSearchQuery, updateConversation, deleteConversation } = useConversations();

  // Track whether the current URL change came from a mid-stream new-conversation
  // navigation so we don't wipe the in-progress message state.
  const skipNextLoadRef = useRef(false);

  useEffect(() => {
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      return;
    }
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      clearMessages();
    }
  }, [conversationId]);

  const handleNewChat = useCallback(() => {
    clearMessages();
    navigate('/chat');
  }, [clearMessages, navigate]);

  const handleSend = useCallback(
    (message: string) => {
      sendMessage(message, conversationId ?? null, (newId) => {
        // A new conversation was created mid-stream. Navigate to its URL but
        // suppress the message reload that useEffect would normally trigger —
        // the stream is still running and already managing message state.
        skipNextLoadRef.current = true;
        navigate(`/chat/${newId}`, { replace: true });
      });
    },
    [conversationId, sendMessage, navigate]
  );

  const handleRegenerate = useCallback(() => {
    if (conversationId) regenerate(conversationId);
  }, [conversationId, regenerate]);

  return (
    <AppLayout
      conversations={conversations}
      isLoadingConversations={isLoading}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewChat={handleNewChat}
      onRename={updateConversation}
      onDelete={deleteConversation}
    >
      <ChatArea
        messages={messages}
        isStreaming={isStreaming}
        error={error}
        userName={user?.name ?? 'You'}
        conversationId={conversationId ?? null}
        onSend={handleSend}
        onStop={stopStreaming}
        onRegenerate={handleRegenerate}
      />
    </AppLayout>
  );
}
