import { useEffect, useId, useRef, useState } from 'react';
import { DEMO_PROJECT } from '../demoBoard';

interface LoadDemoBoardProps {
  taskCount: number;
  onConfirm: () => void;
}

/**
 * "Load demo board" with an inline confirmation step (no browser dialog), so replacing the board is
 * always a deliberate, two-step action. Focus moves into the confirmation and back again afterwards.
 */
export function LoadDemoBoard({ taskCount, onConfirm }: LoadDemoBoardProps) {
  const [confirming, setConfirming] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);
  const dialogId = useId();
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  const message =
    taskCount === 0
      ? `Your board is empty. This adds the ${DEMO_PROJECT} example: 8 tasks across Backlog, In Progress and Shipped.`
      : `This replaces all ${taskCount} task${taskCount === 1 ? '' : 's'} on your board with the ${DEMO_PROJECT} example. You can undo right after, and a backup of your current board is kept in this browser.`;

  return (
    <div className="demo-load">
      <button
        ref={triggerRef}
        type="button"
        className="btn btn--ghost btn--sm demo-load__trigger"
        onClick={() => setConfirming((open) => !open)}
        aria-expanded={confirming}
        aria-controls={confirming ? dialogId : undefined}
      >
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <rect x="3" y="4" width="4" height="12" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="8.5" y="4" width="4" height="8" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <rect x="14" y="4" width="3" height="5" rx="1.2" fill="currentColor" />
        </svg>
        Load demo board
      </button>

      {confirming && (
        <div
          id={dialogId}
          className="demo-confirm"
          role="alertdialog"
          aria-labelledby={titleId}
          aria-describedby={descId}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              setConfirming(false);
            }
          }}
        >
          <p id={titleId} className="demo-confirm__title">
            {taskCount === 0 ? 'Load the demo board?' : 'Replace your board with the demo?'}
          </p>
          <p id={descId} className="demo-confirm__copy">
            {message}
          </p>
          <div className="demo-confirm__actions">
            <button ref={cancelRef} type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirming(false)}>
              Keep my board
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                onConfirm();
                setConfirming(false);
              }}
            >
              {taskCount === 0 ? 'Load demo' : 'Replace with demo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
