/** Hacker House Goa kickoff — midnight India Standard Time, 28 October 2026. */
export const EVENT_NAME = 'Hacker House Goa';
export const EVENT_START = new Date('2026-10-28T00:00:00+05:30').getTime();

export const FOCUS_MINUTES = 25;
export const FOCUS_MS = FOCUS_MINUTES * 60 * 1000;

export const STORAGE_KEYS = {
  tasks: 'goabound:v1:tasks',
  draft: 'goabound:v1:idea-draft',
  timer: 'goabound:v1:timer',
  sessions: 'goabound:v1:focus-sessions',
  /** The board as it was just before "Load demo board" replaced it. */
  boardBackup: 'goabound:v1:board-backup',
  /** Untouched copy of saved board data that could not be read cleanly. */
  recovery: 'goabound:v1:tasks-recovery',
  welcomeDismissed: 'goabound:v1:welcome-dismissed',
} as const;
