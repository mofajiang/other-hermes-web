import { useState } from 'react';
import { Plus, Trash2, Link2, Unplug } from 'lucide-react';
import { cn } from '@/lib/cn';

// ============================================================
// Types
// ============================================================
interface McpEntry {
  id: string;
  name: string;
  command: string;
  args: string[];
  status: 'connected' | 'disconnected' | 'error';
  tools: string[];
}

// ============================================================
// Mock — P2 接 API (GET/POST /mcp)
// ============================================================
const INITIAL_MCPS: McpEntry[] = [
  { id: '1', name: 'filesystem', command: 'npx @anthropic/mcp-filesystem', args: ['/home/project'], status: 'connected', tools: ['read_file', 'write_file', 'list_dir'] },
  { id: '2', name: 'web', command: 'npx @anthropic/mcp-web', args: [], status: 'disconnected', tools: ['web_search', 'web_fetch'] },
];

// ============================================================
// Component
// ============================================================
export function McpPanel() {
  const [mcps, setMcps] = useState<McpEntry[]>(INITIAL_MCPS);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftCommand, setDraftCommand] = useState('');

  const statusColors: Record<McpEntry['status'], string> = {
    connected: 'text-accent-green',
    disconnected: 'text-dark-text-tertiary',
    error: 'text-accent-red',
  };
  const statusLabels: Record<McpEntry['status'], string> = {
    connected: '已连接',
    disconnected: '未连接',
    error: '错误',
  };

  const handleAdd = () => {
    if (!draftName.trim() || !draftCommand.trim()) return;
    setMcps((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: draftName.trim(),
        command: draftCommand.trim(),
        args: [],
        status: 'disconnected',
        tools: [],
      },
    ]);
    setDraftName('');
    setDraftCommand('');
    setAdding(false);
  };

  const handleRemove = (id: string) => {
    setMcps((prev) => prev.filter((m) => m.id !== id));
  };

  const handleToggle = (id: string) => {
    setMcps((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, status: m.status === 'connected' ? 'disconnected' : 'connected' }
          : m
      )
    );
  };

  return (
    <div className="text-xs space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-dark-text-secondary font-medium flex items-center gap-1.5">
          <Link2 size={13} />
          MCP 服务器
        </p>
        <button
          onClick={() => setAdding(true)}
          className="text-2xs text-accent-blue hover:underline flex items-center gap-0.5"
        >
          <Plus size={11} /> 添加
        </button>
      </div>

      {adding && (
        <div className="rounded-md border border-accent-blue/30 bg-accent-blue/5 p-2.5 space-y-2">
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="服务器名称"
            className="w-full px-2 py-1 text-xs rounded bg-dark-bg-tertiary border border-dark-border-default outline-none focus:border-accent-blue text-dark-text-primary placeholder:text-dark-text-tertiary"
          />
          <input
            value={draftCommand}
            onChange={(e) => setDraftCommand(e.target.value)}
            placeholder="启动命令（如 npx @anthropic/mcp-xxx）"
            className="w-full px-2 py-1 text-xs rounded bg-dark-bg-tertiary border border-dark-border-default outline-none focus:border-accent-blue text-dark-text-primary placeholder:text-dark-text-tertiary"
          />
          <div className="flex justify-end gap-1.5">
            <button onClick={() => setAdding(false)} className="px-2.5 py-1 rounded text-2xs text-dark-text-tertiary hover:text-dark-text-primary transition-colors">取消</button>
            <button onClick={handleAdd} disabled={!draftName.trim() || !draftCommand.trim()} className="px-2.5 py-1 rounded text-2xs bg-accent-blue/15 text-accent-blue hover:bg-accent-blue/25 disabled:opacity-30 transition-colors">添加</button>
          </div>
        </div>
      )}

      {mcps.length === 0 && <p className="text-dark-text-tertiary">未配置 MCP</p>}

      {mcps.map((mcp) => (
        <div key={mcp.id} className="rounded-md border border-dark-border-default overflow-hidden">
          <div className="px-2.5 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className={cn('w-2 h-2 rounded-full shrink-0', {
                'bg-accent-green': mcp.status === 'connected',
                'bg-dark-text-tertiary': mcp.status === 'disconnected',
                'bg-accent-red': mcp.status === 'error',
              })} />
              <span className="text-dark-text-primary truncate">{mcp.name}</span>
              <span className={cn('text-2xs font-medium shrink-0', statusColors[mcp.status])}>{statusLabels[mcp.status]}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => handleToggle(mcp.id)}
                className="p-1 rounded hover:bg-dark-bg-tertiary text-dark-text-tertiary hover:text-dark-text-primary transition-colors"
                title={mcp.status === 'connected' ? '断开' : '连接'}
              >
                {mcp.status === 'connected' ? <Unplug size={12} /> : <Link2 size={12} />}
              </button>
              <button
                onClick={() => handleRemove(mcp.id)}
                className="p-1 rounded hover:bg-accent-red/15 text-dark-text-tertiary hover:text-accent-red transition-colors"
                title="移除"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
          <div className="px-2.5 pb-2 text-2xs text-dark-text-tertiary border-t border-dark-border-subtle pt-1.5">
            <p className="font-mono truncate">{mcp.command} {mcp.args.join(' ')}</p>
            {mcp.tools.length > 0 && <p className="mt-1">工具: {mcp.tools.join(', ')}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
