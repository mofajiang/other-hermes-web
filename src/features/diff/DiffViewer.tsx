import { Code2 } from 'lucide-react';

// ============================================================
// DiffViewer
// ============================================================
export function DiffViewer() {
  return (
    <div className="text-xs flex flex-col items-center justify-center py-8 text-dark-text-tertiary gap-2">
      <Code2 size={24} className="opacity-30" />
      <p>暂无代码更改</p>
      <p className="text-2xs text-center">
        在聊天中使用 <code className="text-accent-blue">/diff</code> 命令查看会话中的代码差异
      </p>
    </div>
  );
}
