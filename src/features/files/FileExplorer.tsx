import { useCallback, useEffect, useState } from 'react';
import type { FileEntry } from '@/lib/types';
import { cn } from '@/lib/cn';
import { ChevronRight, FolderOpen, File, Folder, RefreshCw, AlertCircle } from 'lucide-react';

// ============================================================
// FileTreeNode
// ============================================================
function FileTreeNode({ entry, depth = 0 }: { entry: FileEntry; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const isDir = entry.type === 'directory';

  return (
    <div>
      <button
        onClick={() => isDir && setExpanded(!expanded)}
        className={cn(
          'flex items-center gap-1.5 w-full px-2 py-1 text-xs rounded hover:bg-dark-bg-tertiary transition-colors text-left',
          !isDir && 'cursor-default hover:bg-transparent'
        )}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
      >
        {isDir ? (
          <ChevronRight
            size={12}
            className={cn(
              'shrink-0 text-dark-text-tertiary transition-transform',
              expanded && 'rotate-90'
            )}
          />
        ) : (
          <span className="w-3 shrink-0" />
        )}
        {isDir ? (
          expanded ? (
            <FolderOpen size={14} className="text-accent-blue shrink-0" />
          ) : (
            <Folder size={14} className="text-accent-blue shrink-0" />
          )
        ) : (
          <File size={14} className="text-dark-text-tertiary shrink-0" />
        )}
        <span className="truncate text-dark-text-secondary">{entry.name}</span>
        {entry.size && (
          <span className="ml-auto text-2xs text-dark-text-tertiary shrink-0">
            {entry.size >= 1024 ? `${(entry.size / 1024).toFixed(1)}K` : `${entry.size}B`}
          </span>
        )}
      </button>

      {isDir && expanded && entry.children?.map((child) => (
        <FileTreeNode key={child.path} entry={child} depth={depth + 1} />
      ))}
    </div>
  );
}

// ============================================================
// FileExplorer
// ============================================================
type LoadState = 'idle' | 'loading' | 'error' | 'empty';

export function FileExplorer() {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');

  const fetchFiles = useCallback(async () => {
    setLoadState('loading');
    try {
      const res = await fetch('/api/file', { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: FileEntry[] = await res.json();
      if (data.length === 0) {
        setLoadState('empty');
      } else {
        setEntries(data);
        setLoadState('idle');
      }
    } catch {
      setLoadState('empty');
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="text-xs">
      <p className="text-dark-text-tertiary mb-2 text-2xs uppercase tracking-wide">文件浏览器</p>

      {loadState === 'loading' && (
        <div className="flex items-center justify-center gap-1.5 py-8 text-dark-text-tertiary">
          <RefreshCw size={14} className="animate-spin" />
          加载中...
        </div>
      )}

      {loadState === 'empty' && (
        <div className="flex flex-col items-center justify-center py-8 text-dark-text-tertiary gap-2">
          <AlertCircle size={20} className="opacity-40" />
          <p className="text-xs">文件浏览器暂不可用</p>
          <p className="text-2xs text-center">在聊天中使用 <code className="text-accent-blue">/file</code> 命令浏览或搜索文件</p>
        </div>
      )}

      {loadState === 'error' && (
        <div className="flex flex-col items-center justify-center py-8 text-dark-text-tertiary gap-2">
          <AlertCircle size={20} className="opacity-40" />
          <p className="text-xs">加载文件树失败</p>
          <button
            onClick={fetchFiles}
            className="text-2xs text-accent-blue hover:underline flex items-center gap-1"
          >
            <RefreshCw size={10} /> 重试
          </button>
        </div>
      )}

      {loadState === 'idle' && entries.length > 0 && (
        <div className="space-y-px">
          {entries.map((entry) => (
            <FileTreeNode key={entry.path} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
