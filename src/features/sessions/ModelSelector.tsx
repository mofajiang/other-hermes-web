import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Bot } from 'lucide-react';
import { modelsApi } from '@/lib/hermes-client';
import { useSessionStore } from '@/features/sessions/store';
import { useConnectionStore } from '@/lib/connection';
import { cn } from '@/lib/cn';
import type { ModelInfo } from '@/lib/hermes-client';

interface ModelSelectorProps {
  className?: string;
}

export function ModelSelector({ className }: ModelSelectorProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeId = useSessionStore((s) => s.activeId);
  const sessions = useSessionStore((s) => s.sessions);
  const activeSession = sessions.find((s) => s.id === activeId);
  const currentModelId = activeSession?.modelId;
  const isConnected = useConnectionStore((s) => s.status === 'connected');

  // 加载模型列表
  useEffect(() => {
    if (!isConnected) return;
    setIsLoading(true);
    modelsApi.list()
      .then((res) => setModels(res.data || []))
      .catch(() => setModels([]))
      .finally(() => setIsLoading(false));
  }, [isConnected]);

  // 点击外部关闭
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const selectModel = (modelId: string) => {
    if (activeId) {
      useSessionStore.getState().updateSession(activeId, { modelId });
    }
    setIsOpen(false);
  };

  const displayName = currentModelId
    || models.find((m) => m.id === currentModelId)?.id
    || (isConnected ? '选择模型' : '离线');

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => isConnected && setIsOpen((v) => !v)}
        disabled={!isConnected || isLoading}
        className={cn(
          'flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-accent-blue',
          isConnected
            ? 'text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary'
            : 'text-dark-text-tertiary cursor-not-allowed opacity-50'
        )}
        title={isConnected ? '切换模型' : '未连接后端'}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <Bot size={13} className={isConnected ? 'text-accent-blue' : 'text-dark-text-tertiary'} />
        <span className="max-w-[120px] truncate">{displayName}</span>
        {isLoading ? (
          <span className="w-3 h-3 border border-dark-text-tertiary border-t-transparent rounded-full animate-spin" />
        ) : (
          <ChevronDown size={11} className={cn('transition-transform', isOpen && 'rotate-180')} />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-64 max-h-64 overflow-y-auto rounded-lg border border-dark-border-default bg-dark-bg-secondary shadow-dropdown z-50 animate-fade-in"
          role="listbox"
          aria-label="选择 AI 模型"
        >
          <div className="p-1">
            {models.length === 0 && !isLoading && (
              <div className="px-3 py-2 text-xs text-dark-text-tertiary">
                未获取到模型列表
              </div>
            )}
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => selectModel(model.id)}
                className={cn(
                  'flex flex-col w-full px-3 py-1.5 text-xs rounded-md transition-colors text-left',
                  model.id === currentModelId
                    ? 'bg-accent-blue/15 text-accent-blue'
                    : 'text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary'
                )}
                role="option"
                aria-selected={model.id === currentModelId}
              >
                <span className="font-mono truncate">{model.id}</span>
                {model.owned_by && (
                  <span className="text-2xs text-dark-text-tertiary truncate">
                    {model.owned_by}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
