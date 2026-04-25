import { Keyboard, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { SHORTCUTS } from '@/lib/shortcuts';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const modLabel = navigator.platform?.includes('Mac') ? '⌘' : 'Ctrl';

const descriptions: Record<string, string> = {
  command_palette:     '命令面板',
  new_session:         '新建会话',
  close_session:       '关闭当前会话',
  toggle_right_panel:  '折叠/展开右面板',
  toggle_sidebar:      '折叠/展开侧边栏',
  escape:              '关闭弹窗/面板',
};

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-dark-border-default bg-dark-bg-secondary shadow-modal animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border-subtle">
          <h2 className="text-sm font-medium text-dark-text-primary flex items-center gap-1.5">
            <Keyboard size={15} />
            快捷键
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-dark-bg-tertiary text-dark-text-tertiary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-1.5 max-h-80 overflow-y-auto">
          {SHORTCUTS.map((s) => {
            const keys: string[] = [];
            if (s.ctrlOrMeta) keys.push(modLabel);
            if (s.shift) keys.push('Shift');
            if (s.key === 'Escape') keys.push('Esc');
            else keys.push(s.key.toUpperCase());

            return (
              <div key={s.action} className="flex items-center justify-between py-1.5">
                <span className="text-xs text-dark-text-secondary">{descriptions[s.action] || s.action}</span>
                <div className="flex items-center gap-1">
                  {keys.map((k, i) => (
                    <kbd
                      key={i}
                      className="px-1.5 py-0.5 text-2xs rounded border border-dark-border-default bg-dark-bg-tertiary text-dark-text-tertiary font-mono"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="pt-2 border-t border-dark-border-subtle mt-2">
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-dark-text-secondary">发送消息</span>
              <kbd className="px-1.5 py-0.5 text-2xs rounded border border-dark-border-default bg-dark-bg-tertiary text-dark-text-tertiary font-mono">Enter</kbd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-dark-text-secondary">消息换行</span>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-2xs rounded border border-dark-border-default bg-dark-bg-tertiary text-dark-text-tertiary font-mono">Shift</kbd>
                <kbd className="px-1.5 py-0.5 text-2xs rounded border border-dark-border-default bg-dark-bg-tertiary text-dark-text-tertiary font-mono">Enter</kbd>
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-dark-text-secondary">斜杠命令</span>
              <kbd className="px-1.5 py-0.5 text-2xs rounded border border-dark-border-default bg-dark-bg-tertiary text-dark-text-tertiary font-mono">/</kbd>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-xs text-dark-text-secondary">文件/符号搜索</span>
              <kbd className="px-1.5 py-0.5 text-2xs rounded border border-dark-border-default bg-dark-bg-tertiary text-dark-text-tertiary font-mono">@</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
