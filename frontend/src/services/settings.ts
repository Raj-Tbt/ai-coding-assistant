import api from './api';
import type { UserSettings } from '../types/settings';

export const settingsService = {
  get: () => api.get<UserSettings>('/settings/').then((r: { data: UserSettings }) => r.data),
  update: (data: Partial<UserSettings>) => api.patch<UserSettings>('/settings/', data).then((r: { data: UserSettings }) => r.data),
};
