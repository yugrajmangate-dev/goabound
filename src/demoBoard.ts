import type { Status, Task } from './types';

interface DemoSeed {
  title: string;
  description: string;
  status: Status;
}

/** Demo project name, shown in the confirmation step and the success message. */
export const DEMO_PROJECT = 'TideTalk';

/**
 * A small, realistic hackathon project: TideTalk turns voice notes from beach clean-ups into shareable
 * impact reports. The notes double as a tour of GoaBound's features.
 */
const DEMO_SEEDS: DemoSeed[] = [
  {
    title: 'Pitch: voice notes → beach clean-up impact reports',
    description:
      'TideTalk lets volunteers speak what they collected and get a tidy report for local councils.\nTry it: click the pencil to edit this title or these notes.',
    status: 'shipped',
  },
  {
    title: 'Deploy hello-world to a public URL',
    description: 'Shipped on day one so the demo never depends on localhost.',
    status: 'shipped',
  },
  {
    title: 'Record-and-transcribe screen',
    description:
      'Big mic button, live transcript, “Save note”. Works on a phone held in one sandy hand.\nTry it: press “Reopen” to send this back to In Progress.',
    status: 'shipped',
  },
  {
    title: 'Parse notes into item counts',
    description:
      'Turn “twelve bottles, three flip-flops, one fishing net” into a table.\nTry it: focus this card and press Alt + → to ship it.',
    status: 'progress',
  },
  {
    title: 'Impact report page with share link',
    description: 'Totals, a map pin for the beach, and a one-tap share. This is the demo’s “wow” moment.',
    status: 'progress',
  },
  {
    title: 'Record the 2-minute demo at Baga beach',
    description: 'Problem (10s) → live voice note (60s) → report (40s) → what’s next (10s).\nTry it: drag this card into In Progress.',
    status: 'backlog',
  },
  {
    title: 'Write README and submission copy',
    description:
      'Setup, screenshots, stack, and the pitch line.\nTry it: hit “Copy progress report” and paste the Markdown into your submission draft.',
    status: 'backlog',
  },
  {
    title: 'Offline mode for spotty beach signal',
    description: 'Nice-to-have. Queue notes locally and sync later — only if the core demo is solid.',
    status: 'backlog',
  },
];

export function createDemoTasks(): Task[] {
  const now = Date.now();
  return DEMO_SEEDS.map((seed, i) => ({
    ...seed,
    id: `demo-${i + 1}-${now.toString(36)}`,
    source: 'demo' as const,
    createdAt: now + i,
    updatedAt: now + i,
  }));
}
