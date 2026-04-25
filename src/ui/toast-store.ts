import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  add: (type: ToastType, message: string, duration?: number) => void;
  remove: (id: string) => void;
}

let toastCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (type, message, duration = 3000) => {
    const id = `toast-${++toastCounter}`;
    set((s) => ({ toasts: [...s.toasts, { id, type, message, duration }] }));
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
      }, duration);
    }
  },
  remove: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

// Convenience hooks
export function useToast() {
  const add = useToastStore((s) => s.add);
  return {
    success: (msg: string, dur?: number) => add('success', msg, dur),
    error:   (msg: string, dur?: number) => add('error', msg, dur),
    warning: (msg: string, dur?: number) => add('warning', msg, dur),
    info:    (msg: string, dur?: number) => add('info', msg, dur),
  };
}
