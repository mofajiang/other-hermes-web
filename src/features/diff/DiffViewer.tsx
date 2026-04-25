import { useState } from 'react';
import { cn } from '@/lib/cn';

// ============================================================
// Mock diff data — P1 接 API (GET /session/:id/diff)
// ============================================================
interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineOld?: number;
  lineNew?: number;
}

interface DiffFile {
  path: string;
  lines: DiffLine[];
}

const MOCK_DIFFS: DiffFile[] = [
  {
    path: 'src/features/messages/ChatInput.tsx',
    lines: [
      { type: 'unchanged', content: 'import { useState, useRef } from "react";', lineOld: 1, lineNew: 1 },
      { type: 'removed',   content: 'import { Send, Square, Paperclip } from "lucide-react";', lineOld: 2 },
      { type: 'added',     content: 'import { Send, Square, Paperclip, File, Hash } from "lucide-react";', lineNew: 2 },
      { type: 'unchanged', content: 'import { useMessageStore } from "./store";', lineOld: 3, lineNew: 3 },
      { type: 'unchanged', content: '', lineOld: 4, lineNew: 4 },
      { type: 'removed',   content: 'const SLASH_COMMANDS = [];', lineOld: 5 },
      { type: 'added',     content: 'const SLASH_COMMANDS = [', lineNew: 5 },
      { type: 'added',     content: '  { command: "/prompt_async", description: "异步发送提示词" },', lineNew: 6 },
      { type: 'added',     content: '  { command: "/shell", description: "执行 Shell 命令" },', lineNew: 7 },
      { type: 'added',     content: '];', lineNew: 8 },
      { type: 'unchanged', content: '', lineOld: 6, lineNew: 9 },
      { type: 'added',     content: 'const MOCK_FILES = [', lineNew: 10 },
      { type: 'added',     content: '  { path: "src/App.tsx", type: "file" },', lineNew: 11 },
      { type: 'added',     content: '];', lineNew: 12 },
    ],
  },
  {
    path: 'src/lib/api.ts',
    lines: [
      { type: 'unchanged', content: 'const BASE = "/api";', lineOld: 1, lineNew: 1 },
      { type: 'unchanged', content: '', lineOld: 2, lineNew: 2 },
      { type: 'removed',   content: 'const api = {};', lineOld: 3 },
      { type: 'added',     content: 'const api = {', lineNew: 3 },
      { type: 'added',     content: '  session: {', lineNew: 4 },
      { type: 'added',     content: '    list: () => `${BASE}/session`,', lineNew: 5 },
      { type: 'added',     content: '  },', lineNew: 6 },
      { type: 'added',     content: '};', lineNew: 7 },
    ],
  },
];

// ============================================================
// DiffViewer
// ============================================================
const lineColors = {
  added:    'bg-accent-green/10 text-accent-green',
  removed:  'bg-accent-red/10 text-accent-red',
  unchanged: '',
};

const gutterColors = {
  added:    'text-accent-green',
  removed:  'text-accent-red',
  unchanged: 'text-dark-text-tertiary',
};

export function DiffViewer() {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set(MOCK_DIFFS.map(d => d.path)));

  const toggleFile = (path: string) => {
    setExpandedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path); else next.add(path);
      return next;
    });
  };

  if (MOCK_DIFFS.length === 0) {
    return (
      <div className="text-xs text-dark-text-tertiary">
        <p>暂无代码更改</p>
        <p className="mt-1">差异在此会话中执行工具后出现</p>
      </div>
    );
  }

  return (
    <div className="text-xs space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-dark-text-secondary font-medium">代码更改</p>
        <div className="flex items-center gap-3 text-2xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-green" /> 新增</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-accent-red" /> 删除</span>
        </div>
      </div>

      {MOCK_DIFFS.map((file) => {
        const expanded = expandedFiles.has(file.path);
        const added = file.lines.filter((l) => l.type === 'added').length;
        const removed = file.lines.filter((l) => l.type === 'removed').length;

        return (
          <div key={file.path} className="rounded-md border border-dark-border-default overflow-hidden">
            <button
              onClick={() => toggleFile(file.path)}
              className="flex items-center justify-between w-full px-3 py-2 bg-dark-bg-tertiary hover:bg-dark-bg-elevated transition-colors text-left"
            >
              <span className="font-mono text-dark-text-primary truncate">{file.path}</span>
              <span className="text-2xs shrink-0 ml-2">
                <span className="text-accent-green">+{added}</span>
                {' '}
                <span className="text-accent-red">-{removed}</span>
              </span>
            </button>

            {expanded && (
              <div className="overflow-x-auto font-mono text-2xs">
                {file.lines.map((line, i) => (
                  <div
                    key={i}
                    className={cn('flex border-b border-dark-border-subtle last:border-b-0', lineColors[line.type])}
                  >
                    <span className={cn('w-8 text-right pr-2 py-0.5 select-none shrink-0', gutterColors[line.type])}>
                      {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className={cn('w-8 text-right pr-2 py-0.5 select-none shrink-0', gutterColors[line.type])}>
                      {line.lineOld ?? ''}
                    </span>
                    <span className={cn('w-8 text-right pr-2 py-0.5 select-none shrink-0', gutterColors[line.type])}>
                      {line.lineNew ?? ''}
                    </span>
                    <pre className="py-0.5 pr-3 whitespace-pre flex-1 min-w-0">{line.content}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


