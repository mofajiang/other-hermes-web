import { create } from 'zustand';
import type { ThemeMode } from '@/lib/types';

interface ThemeStore {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: (localStorage.getItem('hermes-theme') as ThemeMode) || 'dark',
  resolved: resolveTheme(
    (localStorage.getItem('hermes-theme') as ThemeMode) || 'dark'
  ),
  setMode: (mode) => {
    localStorage.setItem('hermes-theme', mode);
    set({ mode, resolved: resolveTheme(mode) });
  },
}));
