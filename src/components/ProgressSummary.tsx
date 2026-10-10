import { EVENT_NAME, EVENT_START } from '../constants';
import type { Task } from '../types';

interface ProgressSummaryProps {
  tasks: Task[];
  now: number;
}

function verdict(percent: number, total: number): string {
  if (total === 0) return 'No tasks yet — capture an idea to chart the course.';
  if (percent === 100) return 'Everything shipped. Write it up and hit submit.';
  if (percent >= 75) return 'The shore is in sight. Protect the demo path.';
  if (percent >= 40) return 'Good wind. Keep the in-progress lane short.';
  if (percent > 0) return 'First ships are ashore. Momentum compounds.';
  return 'Every voyage starts at the jetty. Ship one small thing.';
}

export function ProgressSummary({ tasks, now }: ProgressSummaryProps) {
  const total = tasks.length;
  const backlog = tasks.filter((t) => t.status === 'backlog').length;
  const progress = tasks.filter((t) => t.status === 'progress').length;
  const shipped = tasks.filter((t) => t.status === 'shipped').length;
  const percent = total === 0 ? 0 : Math.round((shipped / total) * 100);
  const open = backlog + progress;
  const msLeft = EVENT_START - now;
  // Match the header countdown (whole days), but never say "0 days" while the event is still ahead.
  const daysLeft = msLeft > 0 ? Math.max(1, Math.floor(msLeft / 86_400_000)) : 0;
  const pace = daysLeft > 0 && open > 0 ? Math.ceil((open / daysLeft) * 10) / 10 : 0;

  const segments = [
    { key: 'shipped', value: shipped, label: 'Shipped' },
    { key: 'progress', value: progress, label: 'In Progress' },
    { key: 'backlog', value: backlog, label: 'Backlog' },
  ];

  return (
    <section className="panel progress" aria-labelledby="progress-heading">
      <div className="panel__head">
        <p className="eyebrow">Plate IV · Tide chart</p>
        <h2 id="progress-heading" className="panel__title">
          Mission progress
        </h2>
      </div>

      <div className="progress__hero">
        <p className="progress__percent" aria-live="polite" aria-atomic="true">
          <span className="progress__num">{percent}</span>
          <span className="progress__pct">%</span>
          <span className="sr-only"> complete — {shipped} of {total} tasks shipped</span>
        </p>
        <p className="progress__verdict">{verdict(percent, total)}</p>
      </div>

      <div
        className="tide"
        role="progressbar"
        aria-label="Tasks shipped"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}% complete`}
      >
        {total === 0 ? (
          <span className="tide__empty" />
        ) : (
          segments.map((s) =>
            s.value > 0 ? (
              <span
                key={s.key}
                className={`tide__seg tide__seg--${s.key}`}
                style={{ flexGrow: s.value }}
                title={`${s.label}: ${s.value}`}
              />
            ) : null,
          )
        )}
      </div>

      <dl className="stats">
        <div className="stat stat--total">
          <dt>Total</dt>
          <dd>{total}</dd>
        </div>
        <div className="stat stat--backlog">
          <dt>Backlog</dt>
          <dd>{backlog}</dd>
        </div>
        <div className="stat stat--progress">
          <dt>In Progress</dt>
          <dd>{progress}</dd>
        </div>
        <div className="stat stat--shipped">
          <dt>Shipped</dt>
          <dd>{shipped}</dd>
        </div>
      </dl>

      <p className="progress__pace">
        {daysLeft > 0 ? (
          open > 0 ? (
            <>
              <strong>{daysLeft}</strong> {daysLeft === 1 ? 'day' : 'days'} to {EVENT_NAME}. Ship about <strong>{pace}</strong> task{pace === 1 ? '' : 's'} a day
              to arrive with a clean board.
            </>
          ) : (
            <>
              <strong>{daysLeft}</strong> {daysLeft === 1 ? 'day' : 'days'} to {EVENT_NAME}, nothing open. Time for a new idea.
            </>
          )
        ) : (
          <>{EVENT_NAME} is here. Ship what matters most.</>
        )}
        {progress > 3 && <span className="progress__warn"> Heads up: {progress} tasks in progress — finish before you start.</span>}
      </p>
    </section>
  );
}
