import type { RecoveryInfo } from '../storage';

interface RecoveryNoticeProps {
  info: RecoveryInfo;
  onDismiss: () => void;
}

/** Shown when saved data was damaged: explains what was kept and where the untouched original is. */
export function RecoveryNotice({ info, onDismiss }: RecoveryNoticeProps) {
  const summary = info.unreadable
    ? 'Your saved board couldn’t be read, so GoaBound started with an empty board instead of guessing.'
    : [
        `Your saved board had some damaged entries. We kept ${info.kept} task${info.kept === 1 ? '' : 's'}`,
        info.repaired ? `, repaired ${info.repaired}` : '',
        info.dropped ? `, and set aside ${info.dropped} we couldn’t read` : '',
        '.',
      ].join('');

  return (
    <section className="notice notice--warning" role="alert" aria-labelledby="recovery-title">
      <div>
        <h2 id="recovery-title" className="notice__title">
          We recovered your board
        </h2>
        <p className="notice__copy">
          {summary}{' '}
          {info.backupKey ? (
            <>
              The original data is kept untouched in this browser’s local storage under <code>{info.backupKey}</code>, so
              nothing is lost.
            </>
          ) : (
            <>Storage is full, so the original data has been left in place and won’t be overwritten until you edit the board.</>
          )}
        </p>
      </div>
      <button type="button" className="btn btn--ghost btn--sm" onClick={onDismiss}>
        Got it
      </button>
    </section>
  );
}

interface SaveStatusProps {
  ok: boolean;
  savedAt: number | null;
}

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

/** Always-visible indicator of where the board lives and whether the last save worked. */
export function SaveStatus({ ok, savedAt }: SaveStatusProps) {
  return (
    <p className={`save-status${ok ? '' : ' save-status--error'}`}>
      <span className="save-status__dot" aria-hidden="true" />
      {ok ? (
        <>
          <strong>Saved in this browser</strong>
          {savedAt && <span className="save-status__time"> · {timeFormatter.format(savedAt)}</span>}
          <span className="save-status__note"> Only on this device. Nothing is uploaded or synced.</span>
        </>
      ) : (
        <>
          <strong>Not saved</strong>
          <span className="save-status__note">
            {' '}
            This browser is blocking storage or is full. Your board will be lost when you close this tab. Use “Copy progress
            report” to keep a copy.
          </span>
        </>
      )}
    </p>
  );
}
