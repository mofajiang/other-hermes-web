import { useState, useEffect, useRef } from 'react';
import { Search, File, Hash, Settings, Keyboard, Palette, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useSessionStore } from '@/features/sessions/store';
import { useThemeStore } from '@/app/theme/store';
import type { ThemeMode } from '@/lib/types';

// ============================================================
// Command palette items
// ============================================================
interface PaletteItem {
  id: string;
  label: string;
  group: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const sessions = useSessionStore((s) => s.sessions);
  const setActiveId = useSessionStore((s) => s.setActiveId);
  const addSession = useSessionStore((s) => s.addSession);
  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const themeLabels: Record<ThemeMode, string> = { dark: '暗色主题', light: '亮色主题', system: '跟随系统主题' };

  const items: PaletteItem[] = [
    // Sessions
    ...sessions.map((s) => ({
      id: `session-${s.id}`,
      label: s.title,
      group: '会话',
      icon: <MessageSquare size={14} />,
      action: () => { setActiveId(s.id); onClose(); },
    })),
    // Actions
    {
      id: 'new-session',
      label: '新建会话',
      group: '操作',
      icon: <MessageSquare size={14} />,
      action: () => {
        const id = crypto.randomUUID();
        addSession({ id, title: '新会话', status: 'completed', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        setActiveId(id);
        onClose();
      },
    },
    ...(['dark', 'light', 'system'] as ThemeMode[]).map((m) => ({
      id: `theme-${m}`,
      label: themeLabels[m],
      group: '主题',
      icon: <Palette size={14} />,
      action: () => { setThemeMode(m); onClose(); },
    })),
    {
      id: 'shortcuts',
      label: '查看快捷键',
      group: '帮助',
      icon: <Keyboard size={14} />,
      action: () => onClose(),
    },
    {
      id: 'settings',
      label: '打开设置',
      group: '帮助',
      icon: <Settings size={14} />,
      action: () => onClose(),
    },
  ];

  const filtered = query
    ? items.filter((it) => it.label.toLowerCase().includes(query.toLowerCase()))
    : items;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Group filtered items
  const groups = filtered.reduce<Record<string, PaletteItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-dark-border-default bg-dark-bg-secondary shadow-modal animate-fade-in overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-dark-border-subtle">
          <Search size={16} className="text-dark-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索会话、命令、设置..."
            className="flex-1 bg-transparent text-sm outline-none text-dark-text-primary placeholder:text-dark-text-tertiary"
          />
          <kbd className="text-2xs text-dark-text-tertiary border border-dark-border-default rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-1">
          {filtered.length === 0 && (
            <p className="text-xs text-dark-text-tertiary text-center py-6">无匹配结果</p>
          )}
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <p className="px-2.5 py-1 text-2xs text-dark-text-tertiary uppercase tracking-wide">{group}</p>
              {items.map((item) => {
                const idx = flatIndex++;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded transition-colors',
                      idx === selectedIndex
                        ? 'bg-accent-blue/15 text-dark-text-primary'
                        : 'text-dark-text-secondary hover:bg-dark-bg-tertiary'
                    )}
                  >
                    <span className="text-dark-text-tertiary">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
