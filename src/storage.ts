import { STORAGE_KEYS } from './constants';
import { createSampleTasks } from './sampleTasks';
import type { Status, Task, TaskSource } from './types';
import { uid } from './utils';

/** localStorage can throw (private mode, quota, blocked site data) — never let that break the app. */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    /* storage unavailable — the app keeps working in memory */
    return false;
  }
}

export function readString(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}

export function writeString(key: string, value: string): void {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

const STATUSES: Status[] = ['backlog', 'progress', 'shipped'];
const SOURCES: TaskSource[] = ['sample', 'idea', 'manual', 'demo'];

/** True when this browser lets us persist data (it can be blocked, full, or disabled in private modes). */
export function storageAvailable(): boolean {
  try {
    const probe = '__goabound_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

/**
 * Coerce one stored item into a valid task, repairing what we can. Returns null only when there is
 * nothing recognisable to keep (no usable title).
 */
function normalizeTask(value: unknown): { task: Task; repaired: boolean } | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const t = value as Record<string, unknown>;
  const title = typeof t.title === 'string' ? t.title.trim() : typeof t.title === 'number' ? String(t.title) : '';
  if (!title) return null;
  let repaired = title !== t.title;
  const fix = <T,>(ok: boolean, good: T, fallback: T): T => {
    if (!ok) repaired = true;
    return ok ? good : fallback;
  };
  const now = Date.now();
  const task: Task = {
    id: fix(typeof t.id === 'string' && t.id.length > 0, t.id as string, uid()),
    title,
    description: fix(typeof t.description === 'string', t.description as string, ''),
    status: fix(STATUSES.includes(t.status as Status), t.status as Status, 'backlog'),
    source: fix(SOURCES.includes(t.source as TaskSource), t.source as TaskSource, 'manual'),
    createdAt: fix(Number.isFinite(t.createdAt), t.createdAt as number, now),
    updatedAt: fix(Number.isFinite(t.updatedAt), t.updatedAt as number, now),
  };
  return { task, repaired };
}

export interface RecoveryInfo {
  /** localStorage key holding the untouched original data, or null if the copy could not be written. */
  backupKey: string | null;
  kept: number;
  repaired: number;
  dropped: number;
  /** The saved data could not be read as a board at all. */
  unreadable: boolean;
}

export interface LoadResult {
  tasks: Task[];
  /** Nothing has ever been saved in this browser. */
  firstVisit: boolean;
  recovery: RecoveryInfo | null;
}

function keepRawCopy(raw: string): string | null {
  // Never discard data we could not understand: park the original under a recovery key first.
  return writeJSON(STORAGE_KEYS.recovery, { savedAt: new Date().toISOString(), raw }) ? STORAGE_KEYS.recovery : null;
}

/**
 * Load the board. First visit seeds starter tasks; after that, whatever was saved (even an empty board)
 * is respected. Malformed data is repaired where possible and the original is always kept as a backup,
 * so a bad value can never silently wipe someone's board.
 */
export function loadTasks(): LoadResult {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEYS.tasks);
  } catch {
    return { tasks: createSampleTasks(), firstVisit: true, recovery: null };
  }
  if (raw === null) return { tasks: createSampleTasks(), firstVisit: true, recovery: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }
  // Accept a bare array, or an object wrapping one (e.g. a pasted backup: { tasks: [...] }).
  const list = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { tasks?: unknown }).tasks)
      ? (parsed as { tasks: unknown[] }).tasks
      : null;

  if (!list) {
    return {
      tasks: [],
      firstVisit: false,
      recovery: { backupKey: keepRawCopy(raw), kept: 0, repaired: 0, dropped: 0, unreadable: true },
    };
  }

  const tasks: Task[] = [];
  const seen = new Set<string>();
  let repaired = 0;
  let dropped = 0;
  for (const item of list) {
    const result = normalizeTask(item);
    if (!result) {
      dropped += 1;
      continue;
    }
    if (seen.has(result.task.id)) {
      result.task.id = uid();
      result.repaired = true;
    }
    seen.add(result.task.id);
    if (result.repaired) repaired += 1;
    tasks.push(result.task);
  }

  const changed = repaired > 0 || dropped > 0 || !Array.isArray(parsed);
  return {
    tasks,
    firstVisit: false,
    recovery: changed
      ? { backupKey: keepRawCopy(raw), kept: tasks.length, repaired, dropped, unreadable: false }
      : null,
  };
}

/** Persist the board. Returns false when the browser refused (blocked storage or quota exceeded). */
export function saveTasks(tasks: Task[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
