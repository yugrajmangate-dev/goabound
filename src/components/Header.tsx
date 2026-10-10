import { EVENT_NAME, EVENT_START } from '../constants';
import { pad2 } from '../utils';
import { Emblem } from './Emblem';

interface HeaderProps {
  now: number;
}

function splitCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function Header({ now }: HeaderProps) {
  const today = new Date(now);
  const remaining = EVENT_START - now;
  const live = remaining <= 0;
  const { days, hours, minutes, seconds } = splitCountdown(remaining);
  const summary = live
    ? `${EVENT_NAME} has started.`
    : `${days} days, ${hours} hours and ${minutes} minutes until ${EVENT_NAME}.`;

  return (
    <header className="masthead">
      <div className="masthead__brand">
        <Emblem size={64} className="masthead__emblem" />
        <div>
          <p className="eyebrow">Field guide Nº 01 · 15.49° N, 73.82° E</p>
          <h1 className="masthead__title">
            GoaBound<span className="masthead__colon">:</span>{' '}
            <em className="masthead__subtitle">Builder Mission Control</em>
          </h1>
          <p className="masthead__date">
            <span className="sr-only">Today is </span>
            <time dateTime={today.toISOString().slice(0, 10)}>{dateFormatter.format(today)}</time>
          </p>
        </div>
      </div>

      <section className={`countdown${live ? ' countdown--live' : ''}`} aria-label={`Countdown to ${EVENT_NAME}`}>
        <div className="countdown__head">
          <p className="eyebrow eyebrow--coral">{live ? 'Now underway' : 'Countdown to kickoff'}</p>
          <p className="countdown__event">
            {EVENT_NAME} <span className="countdown__when">· 28 Oct 2026, 00:00 IST</span>
          </p>
        </div>
        {live ? (
          <p className="countdown__live" role="status">
            The house is open. Go build.
          </p>
        ) : (
          <div className="countdown__tiles" role="timer" aria-live="off" aria-label={summary}>
            {[
              { v: days, l: days === 1 ? 'day' : 'days' },
              { v: hours, l: 'hrs' },
              { v: minutes, l: 'min' },
              { v: seconds, l: 'sec' },
            ].map((unit) => (
              <div className="countdown__tile" key={unit.l} aria-hidden="true">
                <span className="countdown__num">{unit.l.startsWith('day') ? unit.v : pad2(unit.v)}</span>
                <span className="countdown__unit">{unit.l}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </header>
  );
}
