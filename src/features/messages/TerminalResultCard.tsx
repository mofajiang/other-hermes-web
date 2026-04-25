import { useState } from 'react';
import { Terminal, Copy, Check, X, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * 终端执行结果的数据结构
 * 由 Hermes backend terminal tool 返回的 JSON
 */
export interface TerminalResult {
  output?: string;
  exit_code?: number;
  error?: string | null;
  exit_code_meaning?: string;
  approval?: string;
  session_id?: string;
  pid?: number;
  status?: string;
}

interface TerminalResultCardProps {
  result: TerminalResult | string;
  toolName?: string;
}

export function TerminalResultCard({ result, toolName }: TerminalResultCardProps) {
  const [copied, setCopied] = useState(false);

  // 解析结果
  const parsed: TerminalResult =
    typeof result === 'string'
      ? (() => {
          try {
            return JSON.parse(result) as TerminalResult;
          } catch {
            return { output: result };
          }
        })()
      : result;

  const exitCode = parsed.exit_code ?? 0;
  const success = exitCode === 0;
  const isRunning = parsed.status === 'running' || parsed.status === 'started';
  const output = parsed.output || '';
  const error = parsed.error || '';

  const handleCopy = async () => {
    const text = output || error || '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-2 rounded-md border border-dark-border-subtle overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-dark-bg-secondary border-b border-dark-border-subtle">
        <div className="flex items-center gap-1.5 text-xs">
          <Terminal size={13} className="text-accent-blue" />
          <span className="font-medium text-dark-text-primary">
            {toolName === 'terminal' ? 'Shell' : toolName || '终端'}
          </span>
          {isRunning && (
            <span className="flex items-center gap-1 text-accent-blue">
              <Loader2 size={11} className="animate-spin" />
              执行中...
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Exit code */}
          {!isRunning && (
            <span
              className={cn(
                'text-2xs font-mono px-1.5 py-0.5 rounded',
                success ? 'bg-accent-green/15 text-accent-green' : 'bg-accent-red/15 text-accent-red'
              )}
            >
              exit {exitCode}
              {parsed.exit_code_meaning && ` — ${parsed.exit_code_meaning}`}
            </span>
          )}
          {/* Copy button */}
          {(output || error) && (
            <button
              onClick={handleCopy}
              className="p-0.5 rounded hover:bg-dark-bg-elevated text-dark-text-tertiary hover:text-dark-text-primary transition-colors"
              title="复制输出"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="bg-dark-bg-tertiary">
        {/* Output */}
        {output && (
          <pre className="px-3 py-2 text-xs font-mono overflow-x-auto max-h-64 text-dark-text-primary leading-relaxed">
            {output}
          </pre>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-1.5 px-3 py-2 text-xs text-accent-red bg-accent-red/5 border-t border-accent-red/20">
            <AlertCircle size={12} className="mt-0.5 shrink-0" />
            <span className="font-mono whitespace-pre-wrap">{error}</span>
          </div>
        )}

        {/* Approval note */}
        {parsed.approval && (
          <div className="px-3 py-1.5 text-2xs text-accent-yellow bg-accent-yellow/5 border-t border-accent-yellow/20">
            {parsed.approval}
          </div>
        )}

        {/* Background process info */}
        {parsed.session_id && (
          <div className="px-3 py-1.5 text-2xs text-dark-text-tertiary bg-dark-bg-secondary border-t border-dark-border-subtle font-mono">
            Process: {parsed.session_id}
            {parsed.pid ? ` (PID: ${parsed.pid})` : ''}
          </div>
        )}

        {/* Empty state */}
        {!output && !error && !isRunning && (
          <div className="px-3 py-4 text-xs text-dark-text-tertiary text-center">
            {success ? '命令执行完成（无输出）' : '命令执行失败'}
          </div>
        )}
      </div>
    </div>
  );
}
