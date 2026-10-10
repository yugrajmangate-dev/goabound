export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      /* insecure context — fall through */
    }
  }
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const pad2 = (n: number) => String(n).padStart(2, '0');

export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  return `${pad2(Math.floor(totalSeconds / 60))}:${pad2(totalSeconds % 60)}`;
}

export function todayKey(date = new Date()): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

const BULLET = /^\s*(?:[-*•–—]|\d+[.)]|\[\s?[xX ]?\s?\])\s+/;

export function stripBullet(line: string): string {
  return line.replace(BULLET, '').trim();
}

const TITLE_MAX = 90;

/**
 * Turn free-form (often dictated) text into a task: a short title plus the rest as notes.
 * Dictation tends to produce one long run-on paragraph, so we cut at the first sentence
 * or at a word boundary and keep the full text in the description.
 */
export function ideaToTask(text: string): { title: string; description: string } {
  const clean = text.replace(/\r\n?/g, '\n').trim();
  const lines = clean.split('\n').map((l) => l.trim()).filter(Boolean);
  const first = stripBullet(lines[0] ?? '');
  const rest = lines.slice(1).join('\n');

  if (first.length <= TITLE_MAX) {
    return { title: first, description: rest };
  }

  const sentence = first.match(/^(.{12,}?[.!?])(\s|$)/);
  if (sentence && sentence[1].length <= TITLE_MAX) {
    const title = sentence[1].replace(/[.]$/, '');
    const remainder = first.slice(sentence[1].length).trim();
    return { title, description: [remainder, rest].filter(Boolean).join('\n') };
  }

  const cut = first.slice(0, TITLE_MAX);
  const lastSpace = cut.lastIndexOf(' ');
  const title = `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\s]+$/, '')}…`;
  return { title, description: clean };
}

/** Split a multi-line idea into one task per line (bullets stripped). */
export function ideaToTasks(text: string): { title: string; description: string }[] {
  const lines = text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(stripBullet)
    .filter(Boolean);
  return lines.map((line) => ideaToTask(line));
}
