import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface ContextMenuOption {
  label: string;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

interface ContextMenuProps {
  options: ContextMenuOption[];
  children: ReactNode;
}

export function ContextMenu({ options, children }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open]);

  return (
    <>
      <div onContextMenu={(e) => { e.preventDefault(); setPos({ x: e.clientX, y: e.clientY }); setOpen(true); }}>
        {children}
      </div>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[160px] rounded-lg border border-dark-border-default bg-dark-bg-secondary shadow-modal py-1 animate-fade-in"
          style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {options.map((opt, i) => (
            <button
              key={i}
              disabled={opt.disabled}
              onClick={() => { opt.onClick(); setOpen(false); }}
              className={`
                flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed
                ${opt.danger
                  ? 'text-accent-red hover:bg-accent-red/10'
                  : 'text-dark-text-secondary hover:bg-dark-bg-tertiary hover:text-dark-text-primary'}
              `}
            >
              {opt.icon && <span className="w-3.5">{opt.icon}</span>}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
