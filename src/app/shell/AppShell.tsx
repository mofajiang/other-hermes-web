import { useState, useCallback } from 'react';
import { Sidebar } from '@/features/sessions/Sidebar';
import { TopBar } from '@/features/sessions/TopBar';
import { ChatPanel } from '@/features/messages/ChatPanel';
import { RightPanel } from '@/features/panels/RightPanel';
import { ShareSettingsModal } from '@/features/settings/ShareSettingsModal';
import { CommandPalette } from '@/features/settings/CommandPalette';
import { ShortcutsModal } from '@/features/settings/ShortcutsModal';
import { SettingsModal } from '@/features/settings/SettingsModal';
import { ServerStatusModal } from '@/features/settings/ServerStatusModal';
import { useGlobalShortcuts } from '@/lib/shortcuts';
import { useHermes } from '@/lib/useHermes';
import { useSessionStore } from '@/features/sessions/store';
import { useToast } from '@/ui/toast-store';
import { cn } from '@/lib/cn';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [serverStatusOpen, setServerStatusOpen] = useState(false);
  const addSession = useSessionStore((s) => s.addSession);
  const setActiveId = useSessionStore((s) => s.setActiveId);
  const activeId = useSessionStore((s) => s.activeId);
  const sessions = useSessionStore((s) => s.sessions);
  const removeSession = useSessionStore((s) => s.removeSession);
  const toast = useToast();

  // Hermes 连接
  const hermes = useHermes();

  const activeSession = sessions.find((s) => s.id === activeId);

  const handleNewSession = useCallback(async () => {
    if (hermes.isConnected) {
      const session = await hermes.createSession('新会话');
      if (session) {
        toast.info('已创建新会话（已同步到后端）');
      }
    } else {
      // Mock 模式
      const id = crypto.randomUUID();
      addSession({
        id,
        title: '新会话',
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setActiveId(id);
      toast.info('已创建新会话（离线模式）');
    }
  }, [hermes, addSession, setActiveId, toast]);

  const handleCloseSession = useCallback(async () => {
    if (!activeId) return;
    const title = sessions.find((s) => s.id === activeId)?.title;
    if (hermes.isConnected) {
      await hermes.deleteSession(activeId);
      toast.info(`已关闭会话${title ? `：${title}` : ''}（已同步）`);
    } else {
      removeSession(activeId);
      toast.info(`已关闭会话${title ? `：${title}` : ''}`);
    }
  }, [activeId, sessions, hermes, removeSession, toast]);

  useGlobalShortcuts({
    new_session: handleNewSession,
    close_session: handleCloseSession,
    toggle_sidebar: () => setSidebarOpen((v) => !v),
    toggle_right_panel: () => setRightPanelOpen((v) => !v),
    command_palette: () => setPaletteOpen(true),
    escape: () => {
      setShareOpen(false);
      setPaletteOpen(false);
      setShortcutsOpen(false);
      setSettingsOpen(false);
      setServerStatusOpen(false);
    },
  });

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onServerStatus={() => setServerStatusOpen(true)} />

      <div className="flex flex-1 flex-col min-w-0">
        <TopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleRightPanel={() => setRightPanelOpen(!rightPanelOpen)}
          onShare={() => setShareOpen(true)}
          onShortcuts={() => setShortcutsOpen(true)}
          onSettings={() => setSettingsOpen(true)}
          onServerStatus={() => setServerStatusOpen(true)}
        />

        {/* 连接状态指示条 */}
        {hermes.connectionStatus === 'disconnected' && (
          <div className="px-3 py-1 text-2xs text-accent-yellow bg-accent-yellow/5 border-b border-accent-yellow/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-yellow animate-pulse" />
            离线模式 — 未连接到 Hermes 后端，当前使用模拟数据
          </div>
        )}
        {hermes.connectionStatus === 'checking' && (
          <div className="px-3 py-1 text-2xs text-accent-blue bg-accent-blue/5 border-b border-accent-blue/20 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
            正在检测 Hermes 后端...
          </div>
        )}
        {hermes.connectionStatus === 'connected' && (
          <div className="px-3 py-1 text-2xs text-accent-green bg-accent-green/5 border-b border-accent-green/10 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            已连接 {hermes.baseUrl}
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          <ChatPanel />

          <div
            className={cn(
              'border-l border-dark-border-subtle dark:border-dark-border-subtle light:border-light-border-subtle transition-all duration-200 max-lg:hidden',
              rightPanelOpen ? 'w-right-panel' : 'w-0 overflow-hidden border-l-0'
            )}
          >
            <RightPanel />
          </div>
        </div>
      </div>

      <ShareSettingsModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        sessionTitle={activeSession?.title}
      />
      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
      <ShortcutsModal
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <ServerStatusModal
        isOpen={serverStatusOpen}
        onClose={() => setServerStatusOpen(false)}
      />
    </div>
  );
}
