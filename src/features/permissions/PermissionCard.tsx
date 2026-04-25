import { useState } from 'react';
import { Shield, ChevronRight, Loader2 } from 'lucide-react';
import type { PermissionRequest } from '@/lib/types';
import { cn } from '@/lib/cn';

interface PermissionCardProps {
  permission: PermissionRequest;
  onApprove?: (remember: boolean) => void;
  onDeny?: () => void;
}

const riskConfig = {
  low:    { border: 'border-l-accent-green', bg: 'bg-accent-green/5', label: '低风险', text: 'text-accent-green' },
  medium: { border: 'border-l-accent-yellow', bg: 'bg-accent-yellow/5', label: '中风险', text: 'text-accent-yellow' },
  high:   { border: 'border-l-accent-red', bg: 'bg-accent-red/5', label: '高风险', text: 'text-accent-red' },
};

export function PermissionCard({ permission, onApprove, onDeny }: PermissionCardProps) {
  const [remember, setRemember] = useState(false);
  const [responded, setResponded] = useState(false);
  const [loading, setLoading] = useState<'approve' | 'deny' | null>(null);
  const cfg = riskConfig[permission.riskLevel];

  if (responded) {
    return (
      <div className="my-2 rounded-md border border-dark-border-subtle bg-dark-bg-tertiary px-3 py-2 text-xs text-dark-text-tertiary">
        已回应权限请求
      </div>
    );
  }

  const handleApprove = async () => {
    setLoading('approve');
    try {
      if (onApprove) {
        await onApprove(remember);
      }
      setResponded(true);
    } catch (err) {
      console.error('审批失败:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleDeny = async () => {
    setLoading('deny');
    try {
      if (onDeny) {
        await onDeny();
      }
      setResponded(true);
    } catch (err) {
      console.error('拒绝失败:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={cn(
      'my-2 rounded-md border border-dark-border-subtle border-l-2 px-3 py-2.5 text-xs',
      cfg.border,
      cfg.bg,
    )}>
      <div className="flex items-start gap-2">
        <Shield size={14} className={cn('mt-0.5', cfg.text)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-dark-text-primary">{permission.name}</span>
            <span className={cn('text-2xs font-medium', cfg.text)}>{cfg.label}</span>
          </div>
          <p className="text-dark-text-secondary mt-0.5">{permission.summary}</p>

          {/* Args preview */}
          {Object.keys(permission.args).length > 0 && (
            <details className="mt-1.5">
              <summary className="text-dark-text-tertiary cursor-pointer hover:text-dark-text-secondary flex items-center gap-0.5">
                <ChevronRight size={10} className="transition-transform details-open:rotate-90" />
                参数详情
              </summary>
              <pre className="mt-1 text-dark-text-tertiary text-2xs overflow-x-auto">
                {JSON.stringify(permission.args, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-2.5">
        <label className="flex items-center gap-1.5 text-dark-text-tertiary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="w-3 h-3 rounded accent-accent-blue"
          />
          <span>记住选择</span>
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDeny}
            disabled={loading !== null}
            className="px-3 py-1 rounded-md bg-accent-red/15 text-accent-red hover:bg-accent-red/25 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loading === 'deny' ? <Loader2 size={12} className="animate-spin" /> : '拒绝'}
          </button>
          <button
            onClick={handleApprove}
            disabled={loading !== null}
            className="px-3 py-1 rounded-md bg-accent-green/15 text-accent-green hover:bg-accent-green/25 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {loading === 'approve' ? <Loader2 size={12} className="animate-spin" /> : '允许'}
          </button>
        </div>
      </div>
    </div>
  );
}
