import { useEffect, type ReactNode } from 'react';
import { useThemeStore } from './store';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { resolved } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
  }, [resolved]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const { mode, setMode } = useThemeStore.getState();
      if (mode === 'system') {
        setMode('system'); // triggers resolve
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return <>{children}</>;
}
