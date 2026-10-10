import { STORAGE_KEYS } from './constants';
import { createSampleTasks } from './sampleTasks';
import type { Status, Task, TaskSource } from './types';

/** localStorage can throw (private mode, quota, blocked site data) — never let that break the app. */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the app keeps working in memory */
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
const SOURCES: TaskSource[] = ['sample', 'idea', 'manual'];

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.description === 'string' &&
    STATUSES.includes(t.status as Status) &&
    SOURCES.includes(t.source as TaskSource)
  );
}

/** First visit seeds starter tasks; after that, whatever was saved (even an empty board) is respected. */
export function loadTasks(): Task[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEYS.tasks);
  } catch {
    return createSampleTasks();
  }
  if (raw === null) return createSampleTasks();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createSampleTasks();
    return parsed.filter(isTask).map((t) => ({
      ...t,
      createdAt: typeof t.createdAt === 'number' ? t.createdAt : Date.now(),
      updatedAt: typeof t.updatedAt === 'number' ? t.updatedAt : Date.now(),
    }));
  } catch {
    return createSampleTasks();
  }
}

export function saveTasks(tasks: Task[]): void {
  writeJSON(STORAGE_KEYS.tasks, tasks);
}
