import { useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { PanelLeft, Plus, Terminal, Server, Menu, WifiOff, Database } from 'lucide-react';
import { useSessionStore } from './store';
import { SessionItem } from './SessionItem';
import { cn } from '@/lib/cn';
import { useConnectionStore } from '@/lib/connection';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onServerStatus: () => void;
}

// ============================================================
// Virtual scroll helper — lightweight, zero-dep
// Only renders items in viewport + overscan buffer
// ============================================================
function useVirtualScroll(items: unknown[], itemHeight: number, overscan = 5) {
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setViewportHeight(entries[0].contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + viewportHeight) / itemHeight) + overscan);

  return {
    containerRef,
    onScroll: useCallback(() => {
      if (containerRef.current) setScrollTop(containerRef.current.scrollTop);
    }, []),
    totalHeight,
    startIndex,
    endIndex,
    offsetY: startIndex * itemHeight,
  };
}

// ============================================================
// Sidebar
// ============================================================
export function Sidebar({ isOpen, onToggle, onServerStatus }: SidebarProps) {
  const rawSessions = useSessionStore((s) => s.sessions);
  const search = useSessionStore((s) => s.search);
  const setSearch = useSessionStore((s) => s.setSearch);
  const activeId = useSessionStore((s) => s.activeId);
  const setActiveId = useSessionStore((s) => s.setActiveId);
  const addSession = useSessionStore((s) => s.addSession);
  const dashboardAvailable = useConnectionStore((s) => s.status === 'connected');
  const sessionsLoading = useSessionStore((s) => s.isLoading);

  // Dashboard API not available — sessions are local-only
  const [mobileOverlay, setMobileOverlay] = useState(false);

  const sessions = useMemo(
    () =>
      search
        ? rawSessions.filter((s) =>
            s.title.toLowerCase().includes(search.toLowerCase())
          )
        : rawSessions,
    [rawSessions, search]
  );

  const vs = useVirtualScroll(sessions, 40);

  const handleNew = async () => {
    // 优先使用 Hermes API
    const { useConnectionStore } = await import('@/lib/connection');
    const { sessionApi } = await import('@/lib/hermes-client');

    if (useConnectionStore.getState().status === 'connected') {
      try {
        const session = await sessionApi.create('新会话');
        addSession(session);
        setActiveId(session.id);
        return;
      } catch {
        // fallback to mock
      }
    }
    // Mock fallback
    const id = crypto.randomUUID();
    addSession({
      id,
      title: '新会话',
      status: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveId(id);
  };

  const toggle = () => {
    onToggle();
    setMobileOverlay(false);
  };

  return (
    <>
      {/* Mobile hamburger — only visible < 768px */}
      {!isOpen && (
        <button
          onClick={() => { onToggle(); setMobileOverlay(true); }}
          className="fixed top-2 left-2 z-50 p-2 rounded-md bg-dark-bg-secondary border border-dark-border-default text-dark-text-secondary hover:text-dark-text-primary md:hidden transition-colors"
          aria-label="打开侧边栏"
        >
          <Menu size={18} />
        </button>
      )}

      {/* Mobile overlay backdrop */}
      {isOpen && mobileOverlay && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={toggle}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'flex flex-col border-r border-dark-border-subtle dark:bg-dark-bg-secondary light:bg-light-bg-secondary light:border-light-border-subtle transition-all duration-200 overflow-hidden',
          // Desktop: sidebar behavior
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-40',
          isOpen ? 'w-sidebar min-w-sidebar' : 'w-0 min-w-0 border-r-0 max-md:w-0'
        )}
        role="navigation"
        aria-label="会话导航"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 h-topbar border-b border-dark-border-subtle light:border-light-border-subtle shrink-0">
          <button
            onClick={toggle}
            className="p-1 rounded-md hover:bg-dark-bg-tertiary text-dark-text-secondary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-1"
            aria-label="收起侧边栏"
          >
            <PanelLeft size={18} />
          </button>
          <span className="text-sm font-semibold tracking-tight truncate">Hermes Agent WebUI</span>
        </div>

        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <label htmlFor="session-search" className="sr-only">搜索会话</label>
          <input
            id="session-search"
            type="text"
            placeholder="搜索会话..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-md bg-dark-bg-tertiary dark:text-dark-text-primary light:bg-light-bg-tertiary light:text-light-text-primary border border-dark-border-default light:border-light-border-default outline-none focus:border-accent-blue transition-colors placeholder:text-dark-text-tertiary light:placeholder:text-light-text-tertiary"
          />
        </div>

        {/* Session List — virtual scroll */}
        <div
          ref={vs.containerRef}
          onScroll={vs.onScroll}
          className="flex-1 overflow-y-auto px-2"
          role="listbox"
          aria-label="会话列表"
        >
          {sessionsLoading && (
            <div className="flex items-center justify-center gap-1.5 text-2xs text-dark-text-tertiary py-4">
              <span className="inline-block w-2.5 h-2.5 border border-dark-border-default border-t-accent-blue rounded-full animate-spin" />
              加载中...
            </div>
          )}
          {!sessionsLoading && sessions.length === 0 && (
            <p className="text-xs text-dark-text-tertiary light:text-light-text-tertiary text-center mt-8">暂无会话</p>
          )}
          <div style={{ height: vs.totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${vs.offsetY}px)` }}>
              {sessions.slice(vs.startIndex, vs.endIndex).map((s) => (
                <div key={s.id} style={{ height: 40 }}>
                  <SessionItem
                    session={s}
                    isActive={s.id === activeId}
                    onSelect={() => { setActiveId(s.id); if (mobileOverlay) toggle(); }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-dark-border-subtle light:border-light-border-subtle space-y-1 shrink-0">
          <button
            onClick={handleNew}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary light:text-light-text-secondary light:hover:bg-light-bg-tertiary light:hover:text-light-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            <Plus size={14} />
            新建会话
          </button>
          <button className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary light:text-light-text-secondary light:hover:bg-light-bg-tertiary light:hover:text-light-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue">
            <Terminal size={14} />
            连接终端
          </button>
          <button
            onClick={onServerStatus}
            className="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs rounded-md text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary light:text-light-text-secondary light:hover:bg-light-bg-tertiary light:hover:text-light-text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            <Server size={14} />
            服务器状态
          </button>
          <div className="flex items-center justify-between px-2.5 py-1">
            <div className="flex items-center gap-1 text-2xs text-dark-text-tertiary">
              {dashboardAvailable ? (
                <>
                  <Database size={10} className="text-accent-green" />
                  <span className="text-accent-green">已连接</span>
                </>
              ) : (
                <>
                  <WifiOff size={10} />
                  <span>本地</span>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
