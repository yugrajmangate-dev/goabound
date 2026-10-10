import { useCallback, useEffect, useRef, useState } from 'react';
import { uid } from '../utils';

export type ToastTone = 'success' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
  action?: { label: string; onAction: () => void };
}

export type PushToast = (message: string, options?: { tone?: ToastTone; action?: Toast['action'] }) => void;

export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const handle = timers.current.get(id);
    if (handle) window.clearTimeout(handle);
    timers.current.delete(id);
  }, []);

  const push = useCallback<PushToast>(
    (message, options = {}) => {
      const id = uid();
      const toast: Toast = { id, message, tone: options.tone ?? 'success', action: options.action };
      setToasts((prev) => [...prev.slice(-3), toast]);
      timers.current.set(id, window.setTimeout(() => dismiss(id), toast.action ? 7000 : 4200));
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((handle) => window.clearTimeout(handle));
  }, []);

  return { toasts, push, dismiss };
}
