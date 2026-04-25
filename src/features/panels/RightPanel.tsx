import { useEffect, useState } from 'react';
import {
  FolderOpen,
  GitCompare,
  Wrench,
  Brain,
  Info,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { FileExplorer } from '@/features/files/FileExplorer';
import { DiffViewer } from '@/features/diff/DiffViewer';
import { MemoryPanel, SkillPanel } from '@/features/memory-skills/MemorySkillPanel';
import { McpPanel } from '@/features/tools-mcp/McpPanel';
import { SoulContextEditor } from '@/features/soul-context/SoulContextEditor';
import { useSessionStore } from '@/features/sessions/store';
import { usePanelConfigStore, type PanelTabId } from './panel-config.store';

const ICON_MAP: Record<PanelTabId, React.ReactNode> = {
  files:  <FolderOpen size={15} />,
  diff:   <GitCompare size={15} />,
  tools:  <Wrench size={15} />,
  memory: <Brain size={15} />,
  soul:   <FileText size={15} />,
  meta:   <Info size={15} />,
};

export function RightPanel() {
  const [tab, setTab] = useState<PanelTabId>('files');
  const configTabs = usePanelConfigStore((s) => s.tabs);

  const visibleTabs = configTabs
    .filter((t) => t.enabled)
    .sort((a, b) => a.order - b.order);

  // If current tab is disabled, switch to first visible
  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some((t) => t.id === tab)) {
      setTab(visibleTabs[0].id);
    }
  }, [visibleTabs, tab]);

  // Hide panel if no tabs enabled
  if (visibleTabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-2xs text-dark-text-tertiary px-3">
        所有面板已隐藏，请在设置中开启
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex items-center border-b border-dark-border-subtle light:border-light-border-subtle px-1 shrink-0 overflow-x-auto">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1 px-2.5 py-2 text-xs border-b-2 -mb-px transition-colors whitespace-nowrap',
              tab === t.id
                ? 'border-accent-blue text-dark-text-primary light:text-light-text-primary'
                : 'border-transparent text-dark-text-tertiary light:text-light-text-tertiary hover:text-dark-text-secondary'
            )}
          >
            {ICON_MAP[t.id]}
            <span className="hidden lg:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={cn('flex-1 overflow-y-auto min-h-0', tab === 'soul' ? '' : 'p-3')}>
        {tab === 'files'  && <FileExplorer />}
        {tab === 'diff'   && <DiffViewer />}
        {tab === 'tools'  && <ToolsPanel />}
        {tab === 'memory' && <MemorySkillsPanel />}
        {tab === 'soul'   && <SoulContextEditor />}
        {tab === 'meta'   && <MetaPanel />}
      </div>
    </div>
  );
}

// ============================================================
// Sub-panels
// ============================================================

function ToolsPanel() {
  return <McpPanel />;
}

function MemorySkillsPanel() {
  return (
    <>
      <MemoryPanel />
      <SkillPanel />
    </>
  );
}

function MetaPanel() {
  const activeId = useSessionStore((s) => s.activeId);
  const sessions = useSessionStore((s) => s.sessions);
  const session = sessions.find((s) => s.id === activeId);

  const statusLabels: Record<string, string> = {
    running: '运行中', completed: '已完成', error: '错误', pending_approval: '待审批',
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleString('zh-CN'); } catch { return iso; }
  };

  return (
    <div className="text-xs space-y-3">
      <p className="text-dark-text-secondary font-medium">会话属性</p>
      {session ? (
        <div className="text-dark-text-tertiary space-y-1.5">
          <div className="flex justify-between"><span>标题</span><span className="text-dark-text-primary truncate ml-2">{session.title}</span></div>
          <div className="flex justify-between"><span>状态</span><span className="text-dark-text-primary">{statusLabels[session.status]}</span></div>
          <div className="flex justify-between"><span>创建时间</span><span className="text-dark-text-primary">{formatDate(session.createdAt)}</span></div>
          <div className="flex justify-between"><span>更新时间</span><span className="text-dark-text-primary">{formatDate(session.updatedAt)}</span></div>
          <div className="flex justify-between"><span>模型</span><span className="text-dark-text-primary">{session.modelId || '—'}</span></div>
          <div className="flex justify-between"><span>分享</span><span className="text-dark-text-primary">{session.isShared ? '是' : '否'}</span></div>
        </div>
      ) : (
        <p className="text-dark-text-tertiary">未选择会话</p>
      )}
    </div>
  );
}
