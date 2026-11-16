import type { Conversation } from '../types/conversation';

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function groupConversationsByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  const groups: Record<string, Conversation[]> = {
    'Today': [],
    'Yesterday': [],
    'Previous 7 Days': [],
    'Older': [],
  };

  for (const conv of conversations) {
    const d = new Date(conv.updated_at);
    if (d >= today) groups['Today'].push(conv);
    else if (d >= yesterday) groups['Yesterday'].push(conv);
    else if (d >= weekAgo) groups['Previous 7 Days'].push(conv);
    else groups['Older'].push(conv);
  }

  return groups;
}
