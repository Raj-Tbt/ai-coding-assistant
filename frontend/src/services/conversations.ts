import api from './api';
import type { Conversation } from '../types/conversation';
import type { Message } from '../types/chat';

export const conversationService = {
  getAll: (search?: string) =>
    api.get<Conversation[]>('/conversations/', { params: search ? { search } : {} }).then((r: { data: Conversation[] }) => r.data),

  getOne: (id: string) =>
    api.get<Conversation>(`/conversations/${id}`).then((r: { data: Conversation }) => r.data),

  create: (title?: string) =>
    api.post<Conversation>('/conversations/', { title: title || 'New Chat' }).then((r: { data: Conversation }) => r.data),

  update: (id: string, title: string) =>
    api.patch<Conversation>(`/conversations/${id}`, { title }).then((r: { data: Conversation }) => r.data),

  delete: (id: string) =>
    api.delete(`/conversations/${id}`),

  getMessages: (id: string) =>
    api.get<Message[]>(`/conversations/${id}/messages`).then((r: { data: Message[] }) => r.data),
};
