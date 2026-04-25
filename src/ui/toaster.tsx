import { useToastStore } from './toast-store';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/cn';

const iconMap = {
  success: <CheckCircle size={15} className="text-accent-green" />,
  error:   <AlertCircle size={15} className="text-accent-red" />,
  warning: <AlertTriangle size={15} className="text-accent-yellow" />,
  info:    <Info size={15} className="text-accent-blue" />,
};

const borderMap = {
  success: 'border-l-accent-green',
  error:   'border-l-accent-red',
  warning: 'border-l-accent-yellow',
  info:    'border-l-accent-blue',
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const remove = useToastStore((s) => s.remove);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm"
      role="region"
      aria-label="通知"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-start gap-2.5 px-3 py-2.5 rounded-lg border border-l-2 border-dark-border-default bg-dark-bg-secondary shadow-card animate-slide-up',
            borderMap[t.type]
          )}
          role="alert"
        >
          <span className="shrink-0 mt-px">{iconMap[t.type]}</span>
          <p className="flex-1 text-xs text-dark-text-primary leading-relaxed">{t.message}</p>
          <button
            onClick={() => remove(t.id)}
            className="p-0.5 rounded hover:bg-dark-bg-tertiary text-dark-text-tertiary hover:text-dark-text-primary transition-colors shrink-0"
            aria-label="关闭通知"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
