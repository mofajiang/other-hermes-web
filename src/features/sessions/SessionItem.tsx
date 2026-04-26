import { useState, useRef, useEffect } from 'react';
import type { Session } from '@/lib/types';
import { cn } from '@/lib/cn';
import { ContextMenu } from '@/ui/context-menu';
import { Copy, GitBranch, Square, Trash2, Unlink, Pencil } from 'lucide-react';
import { useSessionStore } from './store';

const statusConfig: Record<Session['status'], { label: string; dot: string }> = {
  running:           { label: '运行中', dot: 'bg-accent-blue' },
  completed:         { label: '已完成', dot: 'bg-accent-green' },
  error:             { label: '错误',   dot: 'bg-accent-red' },
  pending_approval:  { label: '待审批', dot: 'bg-accent-yellow' },
};

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
}

/** Format a timestamp as a relative string (e.g. "2m ago", "昨天", "3天前") */
function formatRelative(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}m前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h前`;
  if (diff < 172800) return '昨天';
  if (diff < 604800) return `${Math.floor(diff / 86400)}d前`;
  return new Date(iso).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

/** Format a timestamp as HH:MM if today, otherwise YYYY-MM-DD */
function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export function SessionItem({ session, isActive, onSelect }: SessionItemProps) {
  const cfg = statusConfig[session.status];
  const removeSession = useSessionStore((s) => s.removeSession);
  const updateSession = useSessionStore((s) => s.updateSession);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== session.title) {
      updateSession(session.id, { title: trimmed });
    } else {
      setDraft(session.title);
    }
    setEditing(false);
  };

  return (
    <ContextMenu
      options={[
        { label: '复制链接', icon: <Copy size={14} />, onClick: () => navigator.clipboard.writeText(`/session/${session.id}`) },
        { label: '重命名', icon: <Pencil size={14} />, onClick: () => { setDraft(session.title); setEditing(true); } },
        { label: '分叉会话', icon: <GitBranch size={14} />, onClick: () => {} },
        ...(session.status === 'running' ? [{ label: '中止', icon: <Square size={14} />, onClick: () => {} }] : []),
        ...(session.isShared ? [{ label: '取消分享', icon: <Unlink size={14} />, onClick: () => {} }] : []),
        { label: '删除', icon: <Trash2 size={14} />, danger: true, onClick: () => removeSession(session.id) },
      ]}
    >
      <button
        onClick={onSelect}
        onDoubleClick={() => { setDraft(session.title); setEditing(true); }}
        className={cn(
          'w-full text-left px-2.5 py-2 rounded-md text-sm transition-colors group',
          isActive
            ? 'bg-dark-bg-tertiary dark:text-dark-text-primary light:bg-light-bg-tertiary light:text-light-text-primary'
            : 'text-dark-text-secondary hover:bg-dark-bg-tertiary light:text-light-text-secondary light:hover:bg-light-bg-tertiary'
        )}
      >
        <div className="flex items-start gap-1.5">
          <span className={cn('w-2 h-2 rounded-full shrink-0 mt-1', cfg.dot)} />
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitRename();
                  if (e.key === 'Escape') { setDraft(session.title); setEditing(false); }
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-1 py-0 text-sm bg-dark-bg-primary border border-accent-blue rounded outline-none text-dark-text-primary"
              />
            ) : (
              <span className="truncate block">{session.title}</span>
            )}
            {session.updatedAt && (
              <span className="text-2xs text-dark-text-tertiary">
                {formatTime(session.updatedAt)}
              </span>
            )}
          </div>
        </div>
      </button>
    </ContextMenu>
  );
}
