import { EVENT_NAME, EVENT_START } from './constants';
import type { Task } from './types';
import { COLUMNS } from './types';

const generatedFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Keep user text from accidentally turning into Markdown structure (headings, lists, emphasis). */
function escapeInline(text: string): string {
  return text.replace(/([\\`*_[\]<>|])/g, '\\$1').replace(/^(#{1,6}\s|[-+]\s|\d+[.)]\s|>)/, '\\$1');
}

function formatTask(task: Task): string {
  const box = task.status === 'shipped' ? '[x]' : '[ ]';
  const lines = [`- ${box} **${escapeInline(task.title.trim())}**`];
  const notes = task.description.trim();
  if (notes) {
    // Indent each line so multi-line notes stay inside the list item.
    notes
      .split(/\r?\n/)
      .forEach((line) => lines.push(line.trim() ? `  ${escapeInline(line.trim())}` : ''));
  }
  return lines.join('\n');
}

/** Build a Markdown progress report of the board, grouped by status in board order. */
export function buildProgressReport(tasks: Task[], now = Date.now()): string {
  const total = tasks.length;
  const counts = COLUMNS.map((col) => ({ col, items: tasks.filter((t) => t.status === col.id) }));
  const shipped = tasks.filter((t) => t.status === 'shipped').length;
  const percent = total === 0 ? 0 : Math.round((shipped / total) * 100);
  const msLeft = EVENT_START - now;
  const daysLeft = Math.max(1, Math.floor(msLeft / 86_400_000));
  const countdown = msLeft > 0 ? `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to ${EVENT_NAME}` : `${EVENT_NAME} is underway`;

  const out: string[] = [
    '# GoaBound progress report',
    '',
    `_Generated ${generatedFormatter.format(new Date(now))} · ${countdown}_`,
    '',
    `**Progress:** ${shipped} of ${total} ${total === 1 ? 'task' : 'tasks'} shipped (${percent}%) · ` +
      counts.map(({ col, items }) => `${col.label}: ${items.length}`).join(' · '),
  ];

  counts.forEach(({ col, items }) => {
    out.push('', `## ${col.label} (${items.length})`, '');
    if (items.length === 0) out.push('_No tasks._');
    else out.push(items.map(formatTask).join('\n'));
  });

  return `${out.join('\n')}\n`;
}

/** Copy text locally. Uses the Clipboard API when available, with a fallback for insecure (http://LAN) contexts. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  const active = document.activeElement as HTMLElement | null;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.top = '-1000px';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  area.remove();
  active?.focus(); // keep keyboard focus on the button that triggered the copy
  return ok;
}
