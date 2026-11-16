export type Theme = 'light' | 'dark' | 'system';

export interface UserSettings {
  theme: Theme;
  preferred_language: string;
}
