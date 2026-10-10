import type { Toast } from '../hooks/useToasts';

interface ToastsProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ICON: Record<Toast['tone'], string> = {
  success: 'M5 10.5l3.2 3.2L15 7',
  info: 'M10 6v.01M10 9v5',
  warning: 'M10 5v6m0 3v.01',
};

export function Toasts({ toasts, onDismiss }: ToastsProps) {
  return (
    <div className="toasts" role="region" aria-label="Notifications">
      <div aria-live="polite" aria-relevant="additions text" className="toasts__stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.tone}`}>
            <svg viewBox="0 0 20 20" width="18" height="18" className="toast__icon" aria-hidden="true">
              <circle cx="10" cy="10" r="9" fill="currentColor" opacity="0.16" />
              <path d={ICON[t.tone]} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="toast__msg">{t.message}</p>
            {t.action && (
              <button
                type="button"
                className="toast__action"
                onClick={() => {
                  t.action?.onAction();
                  onDismiss(t.id);
                }}
              >
                {t.action.label}
              </button>
            )}
            <button type="button" className="toast__close" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
              <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
