import { useState } from 'react';
import { Copy, RefreshCw, Pencil, GitBranch, CheckSquare } from 'lucide-react';
import type { Message } from '@/lib/types';
import { PermissionCard } from '@/features/permissions/PermissionCard';
import { TerminalResultCard } from './TerminalResultCard';
import { cn } from '@/lib/cn';

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: () => void;
  onEdit?: () => void;
  onFork?: () => void;
}

export function MessageBubble({ message, onRegenerate, onEdit, onFork }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = message.content
      .filter((c) => c.type === 'text')
      .map((c) => c.text)
      .join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn('flex gap-3 group', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-lg px-3.5 py-2.5',
          isUser
            ? 'bg-accent-blue/15 text-dark-text-primary light:bg-accent-blue/10 light:text-light-text-primary'
            : 'bg-dark-bg-tertiary text-dark-text-primary light:bg-light-bg-tertiary light:text-light-text-primary'
        )}
      >
        {/* Content */}
        <div className="text-sm whitespace-pre-wrap break-words">
          {message.content.map((block, i) => {
            switch (block.type) {
              case 'text':
                return <span key={i}>{block.text}</span>;
              case 'code':
                return (
                  <div key={i} className="my-2 rounded-md bg-dark-bg-secondary dark:bg-dark-bg-secondary light:bg-light-bg-secondary border border-dark-border-subtle light:border-light-border-subtle overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 text-2xs text-dark-text-tertiary border-b border-dark-border-subtle light:border-light-border-subtle">
                      <span>{block.language || '代码'} {block.fileName && `— ${block.fileName}`}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(block.code)}
                        className="hover:text-dark-text-primary transition-colors"
                      >
                        复制
                      </button>
                    </div>
                    <pre className="px-3 py-2 overflow-x-auto text-xs font-mono">{block.code}</pre>
                  </div>
                );
              case 'tool_call':
                return (
                  <div key={i} className="my-2 rounded-md border border-accent-yellow/30 bg-accent-yellow/5 px-3 py-2 text-xs">
                    <span className="text-accent-yellow font-medium">🔧 {block.toolName}</span>
                    <pre className="mt-1 text-dark-text-tertiary light:text-light-text-tertiary overflow-x-auto">
                      {JSON.stringify(block.args, null, 2)}
                    </pre>
                  </div>
                );
              case 'tool_result':
                if (block.toolName === 'terminal' || block.toolName === 'process') {
                  return <TerminalResultCard key={i} result={block.result} toolName={block.toolName} />;
                }
                return (
                  <div key={i} className="my-2 rounded-md border border-accent-green/30 bg-accent-green/5 px-3 py-2 text-xs">
                    <span className="text-accent-green font-medium">✅ {block.toolName}</span>
                    <pre className="mt-1 text-dark-text-tertiary light:text-light-text-tertiary max-h-32 overflow-y-auto">
                      {(() => {
                        try {
                          const parsed = JSON.parse(block.result);
                          return JSON.stringify(parsed, null, 2);
                        } catch {
                          return block.result;
                        }
                      })()}
                    </pre>
                  </div>
                );
              case 'permission_request':
                return <PermissionCard key={i} permission={block.permission} />;
              case 'error':
                return (
                  <div key={i} className="my-2 rounded-md border border-accent-red/30 bg-accent-red/5 px-3 py-2 text-xs text-accent-red">
                    ⚠️ {block.message}
                  </div>
                );
              default:
                return null;
            }
          })}

          {message.isStreaming && (
            <span className="inline-block w-2 h-4 bg-accent-blue animate-pulse ml-0.5 align-text-bottom" />
          )}
        </div>

        {/* Actions — 悬停显示 */}
        {!message.isStreaming && !isUser && (
          <div className="flex items-center gap-0.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy} className="p-1 rounded hover:bg-dark-bg-elevated text-dark-text-tertiary hover:text-dark-text-primary transition-colors" title="复制">
              {copied ? <CheckSquare size={13} /> : <Copy size={13} />}
            </button>
            <button onClick={onRegenerate} className="p-1 rounded hover:bg-dark-bg-elevated text-dark-text-tertiary hover:text-dark-text-primary transition-colors" title="重新生成">
              <RefreshCw size={13} />
            </button>
            <button onClick={onEdit} className="p-1 rounded hover:bg-dark-bg-elevated text-dark-text-tertiary hover:text-dark-text-primary transition-colors" title="编辑重发">
              <Pencil size={13} />
            </button>
            <button onClick={onFork} className="p-1 rounded hover:bg-dark-bg-elevated text-dark-text-tertiary hover:text-dark-text-primary transition-colors" title="分叉">
              <GitBranch size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
