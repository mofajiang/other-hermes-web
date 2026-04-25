import {
  PanelLeft,
  PanelRight,
  SunMoon,
  Share2,
  Settings,
  Keyboard,
} from 'lucide-react';
import { useSessionStore } from './store';
import { useThemeStore } from '@/app/theme/store';
import { ModelSelector } from './ModelSelector';
import type { ThemeMode } from '@/lib/types';

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleRightPanel: () => void;
  onShare: () => void;
  onShortcuts: () => void;
  onSettings: () => void;
  onServerStatus: () => void;
}

const themeCycle: ThemeMode[] = ['dark', 'light', 'system'];
const themeLabels: Record<ThemeMode, string> = { dark: '暗色', light: '亮色', system: '跟随系统' };

export function TopBar({ onToggleSidebar, onToggleRightPanel, onShare, onShortcuts, onSettings, onServerStatus }: TopBarProps) {
  const activeId = useSessionStore((s) => s.activeId);
  const sessions = useSessionStore((s) => s.sessions);
  const activeSession = sessions.find((s) => s.id === activeId);
  const { mode, setMode } = useThemeStore();

  const cycleTheme = () => {
    const idx = themeCycle.indexOf(mode);
    setMode(themeCycle[(idx + 1) % themeCycle.length]);
  };

  return (
    <header
      className="flex items-center justify-between h-topbar px-3 border-b border-dark-border-subtle light:border-light-border-subtle shrink-0 backdrop-blur-sm bg-dark-bg-primary/80 light:bg-light-bg-primary/80"
      role="banner"
    >
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-1 rounded-md hover:bg-dark-bg-tertiary text-dark-text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue"
          aria-label="切换侧边栏"
        >
          <PanelLeft size={18} />
        </button>
        {activeSession && (
          <span className="text-sm font-medium truncate">{activeSession.title}</span>
        )}
      </div>

      {/* Center */}
      <div className="flex items-center gap-1">
        <ModelSelector />
        <button
          onClick={cycleTheme}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded-md text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary light:text-light-text-secondary light:hover:bg-light-bg-tertiary light:hover:text-light-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue"
          title={`主题：${themeLabels[mode]}`}
          aria-label={`当前主题：${themeLabels[mode]}，点击切换`}
        >
          <SunMoon size={14} />
          <span className="hidden sm:inline">{themeLabels[mode]}</span>
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        <button
          onClick={onShortcuts}
          className="p-1.5 rounded-md text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary light:text-light-text-secondary light:hover:bg-light-bg-tertiary light:hover:text-light-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue"
          aria-label="快捷键"
          title="快捷键"
        >
          <Keyboard size={16} />
        </button>
        <button
          onClick={onShare}
          className="p-1.5 rounded-md text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary light:text-light-text-secondary light:hover:bg-light-bg-tertiary light:hover:text-light-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue"
          aria-label="分享"
        >
          <Share2 size={16} />
        </button>
        <button
          onClick={onSettings}
          className="p-1.5 rounded-md text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary light:text-light-text-secondary light:hover:bg-light-bg-tertiary light:hover:text-light-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue"
          aria-label="设置"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={onToggleRightPanel}
          className="p-1.5 rounded-md text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary light:text-light-text-secondary light:hover:bg-light-bg-tertiary light:hover:text-light-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue max-lg:hidden"
          aria-label="切换右面板"
        >
          <PanelRight size={16} />
        </button>
      </div>
    </header>
  );
}
