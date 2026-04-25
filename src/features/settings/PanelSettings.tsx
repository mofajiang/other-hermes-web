import { FolderOpen, GitCompare, Wrench, Brain, FileText, Info, RotateCcw } from 'lucide-react';
import { usePanelConfigStore, type PanelTabId } from '@/features/panels/panel-config.store';
import { cn } from '@/lib/cn';

const ICON_MAP: Record<PanelTabId, React.ReactNode> = {
  files:  <FolderOpen size={14} />,
  diff:   <GitCompare size={14} />,
  tools:  <Wrench size={14} />,
  memory: <Brain size={14} />,
  soul:   <FileText size={14} />,
  meta:   <Info size={14} />,
};

export function PanelSettings() {
  const tabs = usePanelConfigStore((s) => s.tabs);
  const toggleTab = usePanelConfigStore((s) => s.toggleTab);
  const resetToDefault = usePanelConfigStore((s) => s.resetToDefault);

  const sorted = [...tabs].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4 text-xs">
      <div className="space-y-1">
        <p className="text-dark-text-primary font-medium">右侧栏面板</p>
        <p className="text-2xs text-dark-text-tertiary">
          选择要在右侧栏中显示的功能面板，关闭后对应的标签页将隐藏。
        </p>
      </div>

      <div className="space-y-1">
        {sorted.map((tab) => (
          <div
            key={tab.id}
            className={cn(
              'flex items-center justify-between px-3 py-2.5 rounded-md border transition-colors',
              tab.enabled
                ? 'border-dark-border-default'
                : 'border-dark-border-subtle opacity-60'
            )}
          >
            <div className="flex items-center gap-2.5">
              <span className={tab.enabled ? 'text-dark-text-primary' : 'text-dark-text-tertiary'}>
                {ICON_MAP[tab.id]}
              </span>
              <div>
                <p className={cn(
                  'text-xs',
                  tab.enabled ? 'text-dark-text-primary' : 'text-dark-text-tertiary'
                )}>
                  {tab.label}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleTab(tab.id)}
              className={cn(
                'w-9 h-5 rounded-full transition-colors relative',
                tab.enabled ? 'bg-accent-blue' : 'bg-dark-bg-elevated'
              )}
              role="switch"
              aria-checked={tab.enabled}
            >
              <div className={cn(
                'w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform',
                tab.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
              )} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={resetToDefault}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-2xs border border-dark-border-default text-dark-text-tertiary hover:text-dark-text-primary hover:border-dark-border-subtle transition-colors"
      >
        <RotateCcw size={12} />
        重置为默认
      </button>
    </div>
  );
}
