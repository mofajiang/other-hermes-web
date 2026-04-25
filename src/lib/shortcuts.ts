import { useEffect, type ReactNode } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutDef {
  key: string;
  ctrlOrMeta: boolean;
  shift?: boolean;
  action: string;
}

const SHORTCUTS: ShortcutDef[] = [
  { key: 'k',       ctrlOrMeta: true,  action: 'command_palette' },
  { key: 'n',       ctrlOrMeta: true,  action: 'new_session' },
  { key: 'w',       ctrlOrMeta: true,  action: 'close_session' },
  { key: '/',       ctrlOrMeta: true,  action: 'toggle_right_panel' },
  { key: 'b',       ctrlOrMeta: true,  action: 'toggle_sidebar' },
  { key: 'Escape',  ctrlOrMeta: false, action: 'escape' },
];

export type ShortcutAction = (typeof SHORTCUTS)[number]['action'];

export function useGlobalShortcuts(handlers: Partial<Record<ShortcutAction, () => void>>) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      for (const s of SHORTCUTS) {
        if (
          e.key.toLowerCase() === s.key.toLowerCase() &&
          mod === s.ctrlOrMeta &&
          (s.shift === undefined || e.shiftKey === s.shift)
        ) {
          const fn = handlers[s.action as ShortcutAction];
          if (fn) {
            e.preventDefault();
            fn();
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlers]);
}

export { SHORTCUTS };
