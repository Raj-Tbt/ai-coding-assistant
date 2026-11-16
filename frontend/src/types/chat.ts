export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  isStreaming?: boolean;
}

export interface ChatRequest {
  conversation_id: string | null;
  message: string;
  regenerate?: boolean;
}

export interface SSEEvent {
  type: 'start' | 'chunk' | 'done' | 'error';
  conversation_id?: string;
  content?: string;
  message_id?: string;
  error?: string;
}
