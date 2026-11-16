import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '../services/settings';
import type { UserSettings } from '../types/settings';

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<UserSettings>) => settingsService.update(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  return { settings, isLoading, updateSettings: mutation.mutateAsync };
}
