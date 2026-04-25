import { useState } from 'react';
import type { FileEntry } from '@/lib/types';
import { cn } from '@/lib/cn';
import { ChevronRight, FolderOpen, File, Folder } from 'lucide-react';

// ============================================================
// Mock tree — P1 替换为 API 数据
// ============================================================
const mockTree: FileEntry[] = [
  {
    path: 'src', name: 'src', type: 'directory',
    children: [
      {
        path: 'src/app', name: 'app', type: 'directory',
        children: [
          { path: 'src/app/App.tsx', name: 'App.tsx', type: 'file', size: 342 },
          {
            path: 'src/app/shell', name: 'shell', type: 'directory',
            children: [
              { path: 'src/app/shell/AppShell.tsx', name: 'AppShell.tsx', type: 'file', size: 1200 },
            ],
          },
          {
            path: 'src/app/theme', name: 'theme', type: 'directory',
            children: [
              { path: 'src/app/theme/ThemeProvider.tsx', name: 'ThemeProvider.tsx', type: 'file', size: 840 },
              { path: 'src/app/theme/store.ts', name: 'store.ts', type: 'file', size: 320 },
            ],
          },
        ],
      },
      {
        path: 'src/features', name: 'features', type: 'directory',
        children: [
          {
            path: 'src/features/sessions', name: 'sessions', type: 'directory',
            children: [
              { path: 'src/features/sessions/Sidebar.tsx', name: 'Sidebar.tsx', type: 'file', size: 2300 },
              { path: 'src/features/sessions/SessionItem.tsx', name: 'SessionItem.tsx', type: 'file', size: 450 },
              { path: 'src/features/sessions/TopBar.tsx', name: 'TopBar.tsx', type: 'file', size: 1100 },
              { path: 'src/features/sessions/store.ts', name: 'store.ts', type: 'file', size: 600 },
            ],
          },
          {
            path: 'src/features/messages', name: 'messages', type: 'directory',
            children: [
              { path: 'src/features/messages/ChatPanel.tsx', name: 'ChatPanel.tsx', type: 'file', size: 780 },
              { path: 'src/features/messages/MessageBubble.tsx', name: 'MessageBubble.tsx', type: 'file', size: 2100 },
              { path: 'src/features/messages/ChatInput.tsx', name: 'ChatInput.tsx', type: 'file', size: 1600 },
              { path: 'src/features/messages/store.ts', name: 'store.ts', type: 'file', size: 420 },
            ],
          },
          {
            path: 'src/features/permissions', name: 'permissions', type: 'directory',
            children: [
              { path: 'src/features/permissions/PermissionCard.tsx', name: 'PermissionCard.tsx', type: 'file', size: 1500 },
            ],
          },
        ],
      },
      {
        path: 'src/lib', name: 'lib', type: 'directory',
        children: [
          { path: 'src/lib/types.ts', name: 'types.ts', type: 'file', size: 900 },
          { path: 'src/lib/cn.ts', name: 'cn.ts', type: 'file', size: 80 },
          { path: 'src/lib/api.ts', name: 'api.ts', type: 'file', size: 320 },
          { path: 'src/lib/sse.ts', name: 'sse.ts', type: 'file', size: 550 },
        ],
      },
      { path: 'src/globals.css', name: 'globals.css', type: 'file', size: 210 },
      { path: 'src/main.tsx', name: 'main.tsx', type: 'file', size: 130 },
    ],
  },
  { path: 'index.html', name: 'index.html', type: 'file', size: 480 },
  { path: 'package.json', name: 'package.json', type: 'file', size: 1100 },
  { path: 'tailwind.config.ts', name: 'tailwind.config.ts', type: 'file', size: 800 },
  { path: 'vite.config.ts', name: 'vite.config.ts', type: 'file', size: 340 },
];

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
export function FileExplorer() {
  return (
    <div className="text-xs">
      <p className="text-dark-text-tertiary mb-2 text-2xs uppercase tracking-wide">文件浏览器</p>
      <div className="space-y-px">
        {mockTree.map((entry) => (
          <FileTreeNode key={entry.path} entry={entry} />
        ))}
      </div>
    </div>
  );
}
