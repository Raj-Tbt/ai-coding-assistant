import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationService } from '../services/conversations';

export function useConversations() {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', searchQuery],
    queryFn: () => conversationService.getAll(searchQuery || undefined),
  });

  const createMutation = useMutation({
    mutationFn: (title?: string) => conversationService.create(title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) =>
      conversationService.update(id, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => conversationService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conversations'] }),
  });

  return {
    conversations,
    isLoading,
    searchQuery,
    setSearchQuery,
    createConversation: createMutation.mutateAsync,
    updateConversation: (id: string, title: string) => updateMutation.mutateAsync({ id, title }),
    deleteConversation: deleteMutation.mutateAsync,
  };
}
