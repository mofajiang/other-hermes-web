import { useState } from 'react';
import { X, Monitor, Cpu, HardDrive, Globe, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ServerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data
const INSTANCES = [
  { name: 'hermes-api-server', port: 8642, protocol: 'OpenAI API', status: 'healthy' as const, version: '0.9.2', uptime: '3d 12h' },
  { name: 'hermes-gateway', port: 8080, protocol: 'HTTP/SSE', status: 'healthy' as const, version: '0.9.2', uptime: '3d 12h' },
  { name: 'hermes-mcp', port: 0, protocol: 'stdio', status: 'stopped' as const, version: '0.9.1', uptime: '—' },
];

const statusStyles: Record<string, { dot: string; label: string }> = {
  healthy: { dot: 'bg-accent-green', label: '健康' },
  degraded: { dot: 'bg-accent-yellow', label: '降级' },
  stopped: { dot: 'bg-dark-text-tertiary', label: '已停止' },
  error: { dot: 'bg-accent-red', label: '错误' },
};

export function ServerStatusModal({ isOpen, onClose }: ServerStatusModalProps) {
  if (!isOpen) return null;

  const healthyCount = INSTANCES.filter((i) => i.status === 'healthy').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-dark-border-default bg-dark-bg-secondary shadow-modal animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border-subtle">
          <h2 className="text-sm font-medium text-dark-text-primary">服务器状态</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-dark-bg-tertiary text-dark-text-tertiary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Overview */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-dark-bg-tertiary p-3 text-center">
              <Cpu size={18} className="mx-auto text-accent-blue mb-1" />
              <p className="text-lg font-semibold text-dark-text-primary">{INSTANCES.length}</p>
              <p className="text-2xs text-dark-text-tertiary">实例</p>
            </div>
            <div className="rounded-lg bg-dark-bg-tertiary p-3 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {healthyCount === INSTANCES.length ? <Wifi size={18} className="text-accent-green" /> : <WifiOff size={18} className="text-accent-yellow" />}
              </div>
              <p className="text-lg font-semibold text-dark-text-primary">{healthyCount}/{INSTANCES.length}</p>
              <p className="text-2xs text-dark-text-tertiary">健康</p>
            </div>
            <div className="rounded-lg bg-dark-bg-tertiary p-3 text-center">
              <Globe size={18} className="mx-auto text-accent-purple mb-1" />
              <p className="text-lg font-semibold text-dark-text-primary">v0.9</p>
              <p className="text-2xs text-dark-text-tertiary">版本</p>
            </div>
          </div>

          {/* Instance list */}
          <div className="space-y-2">
            <p className="text-xs text-dark-text-secondary font-medium">实例列表</p>
            {INSTANCES.map((inst) => {
              const st = statusStyles[inst.status];
              return (
                <div key={inst.name} className="rounded-md border border-dark-border-default px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn('w-2 h-2 rounded-full', st.dot)} />
                      <span className="text-xs font-medium text-dark-text-primary">{inst.name}</span>
                    </div>
                    <span className={cn('text-2xs font-medium', inst.status === 'healthy' ? 'text-accent-green' : 'text-dark-text-tertiary')}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-2xs text-dark-text-tertiary">
                    <span className="flex items-center gap-1"><Monitor size={10} /> :{inst.port}</span>
                    <span>{inst.protocol}</span>
                    <span>v{inst.version}</span>
                    <span>运行 {inst.uptime}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
