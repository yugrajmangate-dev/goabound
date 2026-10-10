import { useCallback, useEffect, useRef, useState } from 'react';
import { FOCUS_MINUTES, FOCUS_MS, STORAGE_KEYS } from '../constants';
import type { PushToast } from '../hooks/useToasts';
import { readJSON, writeJSON } from '../storage';
import { formatClock, todayKey } from '../utils';

type TimerStatus = 'idle' | 'running' | 'paused' | 'done';

interface TimerState {
  status: TimerStatus;
  /** Remaining time while idle/paused/done. */
  remaining: number;
  /** Wall-clock end time while running — keeps the timer accurate across tab sleeps and reloads. */
  endsAt: number | null;
}

interface SessionLog {
  date: string;
  count: number;
}

const INITIAL: TimerState = { status: 'idle', remaining: FOCUS_MS, endsAt: null };

function loadTimer(): TimerState {
  const saved = readJSON<TimerState | null>(STORAGE_KEYS.timer, null);
  if (!saved || typeof saved.remaining !== 'number') return INITIAL;
  if (saved.status === 'running' && typeof saved.endsAt === 'number') {
    const left = saved.endsAt - Date.now();
    return left > 0 ? saved : { status: 'done', remaining: 0, endsAt: null };
  }
  if (saved.status === 'paused' || saved.status === 'done') {
    return { status: saved.status, remaining: Math.min(FOCUS_MS, Math.max(0, saved.remaining)), endsAt: null };
  }
  return INITIAL;
}

function loadSessions(): number {
  const log = readJSON<SessionLog | null>(STORAGE_KEYS.sessions, null);
  return log && log.date === todayKey() ? log.count : 0;
}

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface FocusTimerProps {
  notify: PushToast;
}

export function FocusTimer({ notify }: FocusTimerProps) {
  const [timer, setTimer] = useState<TimerState>(loadTimer);
  const [now, setNow] = useState(() => Date.now());
  const [sessions, setSessions] = useState(loadSessions);
  const [announcement, setAnnouncement] = useState('');
  const audioRef = useRef<AudioContext | null>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  const running = timer.status === 'running';
  const remaining = running && timer.endsAt ? Math.max(0, timer.endsAt - now) : timer.remaining;
  const progress = 1 - remaining / FOCUS_MS;

  useEffect(() => writeJSON(STORAGE_KEYS.timer, timer), [timer]);

  const chime = useCallback(() => {
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = audioRef.current ?? new Ctx();
      audioRef.current = ctx;
      [0, 0.22, 0.44].forEach((offset, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = [660, 880, 990][i];
        const t = ctx.currentTime + offset;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.18, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    } catch {
      /* audio is a nicety */
    }
  }, []);

  // Tick while running and detect completion.
  useEffect(() => {
    if (!running || !timer.endsAt) return;
    const endsAt = timer.endsAt;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= endsAt) {
        setTimer({ status: 'done', remaining: 0, endsAt: null });
        setSessions((prev) => {
          const count = prev + 1;
          writeJSON(STORAGE_KEYS.sessions, { date: todayKey(), count } satisfies SessionLog);
          return count;
        });
        chime();
        notify('Focus session complete. Stretch, hydrate, then ship the next thing.', { tone: 'success' });
        setAnnouncement('Focus session complete.');
      }
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [running, timer.endsAt, chime, notify]);

  // Reflect the running timer in the tab title and on the page chrome.
  useEffect(() => {
    const base = 'GoaBound · Builder Mission Control';
    if (running) document.title = `${formatClock(remaining)} · Focusing · GoaBound`;
    else if (timer.status === 'paused') document.title = `Paused ${formatClock(remaining)} · GoaBound`;
    else document.title = base;
  }, [running, remaining, timer.status]);

  useEffect(() => {
    document.documentElement.dataset.focus = running ? 'on' : 'off';
    return () => {
      document.documentElement.dataset.focus = 'off';
    };
  }, [running]);

  const start = () => {
    // Create/resume audio during a user gesture so the end chime is allowed to play.
    try {
      if (!audioRef.current && window.AudioContext) audioRef.current = new AudioContext();
      void audioRef.current?.resume();
    } catch {
      /* ignore */
    }
    const from = timer.status === 'done' || timer.remaining <= 0 ? FOCUS_MS : timer.remaining;
    const t = Date.now();
    setNow(t);
    setTimer({ status: 'running', remaining: from, endsAt: t + from });
    setAnnouncement(timer.status === 'paused' ? 'Timer resumed.' : `Focus timer started: ${Math.ceil(from / 60000)} minutes.`);
  };

  const pause = () => {
    const left = timer.endsAt ? Math.max(0, timer.endsAt - Date.now()) : timer.remaining;
    setTimer({ status: 'paused', remaining: left, endsAt: null });
    setAnnouncement(`Timer paused at ${formatClock(left)}.`);
  };

  const reset = () => {
    setTimer(INITIAL);
    setAnnouncement(`Timer reset to ${FOCUS_MINUTES} minutes.`);
    startButtonRef.current?.focus();
  };

  const statusLabel: Record<TimerStatus, string> = {
    idle: 'Ready when you are',
    running: 'Focusing',
    paused: 'Paused',
    done: 'Session complete',
  };

  return (
    <section className={`panel timer timer--${timer.status}`} aria-labelledby="timer-heading">
      <div className="panel__head">
        <p className="eyebrow">Plate III · Deep-water focus</p>
        <h2 id="timer-heading" className="panel__title">
          {FOCUS_MINUTES}-minute focus
        </h2>
      </div>

      <div className="timer__body">
        <div className="timer__dial">
          <svg viewBox="0 0 200 200" className="timer__ring" aria-hidden="true">
            <circle className="timer__track" cx="100" cy="100" r={RADIUS} />
            <circle
              className="timer__ticks"
              cx="100"
              cy="100"
              r={RADIUS + 7}
              strokeDasharray={`1 ${(2 * Math.PI * (RADIUS + 7)) / 60 - 1}`}
            />
            <circle
              className="timer__progress"
              cx="100"
              cy="100"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div className="timer__readout">
            <span className="timer__status">
              {running && <span className="live-dot" aria-hidden="true" />}
              {statusLabel[timer.status]}
            </span>
            <span className="timer__time" role="timer" aria-live="off" aria-label={`${formatClock(remaining)} remaining`}>
              {formatClock(remaining)}
            </span>
            <span className="timer__sessions">
              {sessions === 0 ? 'No sessions yet today' : `${sessions} session${sessions === 1 ? '' : 's'} today`}
            </span>
          </div>
        </div>

        <div className="timer__controls">
          <button
            ref={startButtonRef}
            type="button"
            className="btn btn--primary timer__toggle"
            onClick={running ? pause : start}
          >
            {running ? (
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <rect x="5" y="4" width="3.5" height="12" rx="1" fill="currentColor" />
                <rect x="11.5" y="4" width="3.5" height="12" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                <path d="M6 4l10 6-10 6z" fill="currentColor" />
              </svg>
            )}
            {running ? 'Pause' : timer.status === 'paused' ? 'Resume' : timer.status === 'done' ? 'Start another' : 'Start focus'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={reset}
            disabled={timer.status === 'idle' && timer.remaining === FOCUS_MS}
          >
            Reset
          </button>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
