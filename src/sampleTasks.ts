import type { Status, Task } from './types';

interface SampleSeed {
  id: string;
  title: string;
  description: string;
  status: Status;
}

const SEEDS: SampleSeed[] = [
  {
    id: 'sample-scaffold',
    title: 'Scaffold the repo and deploy a hello-world',
    description: 'A live URL on day one removes the scariest unknown. Push, deploy, confirm it loads on your phone.',
    status: 'shipped',
  },
  {
    id: 'sample-flow',
    title: 'Sketch the core user flow on paper',
    description: 'Three to five screens, max. Circle the single moment that makes a judge say “oh, nice”.',
    status: 'progress',
  },
  {
    id: 'sample-pitch',
    title: 'Write the one-sentence pitch',
    description: 'Who is it for, what pain does it remove, and why now? Keep it under 20 words.',
    status: 'backlog',
  },
  {
    id: 'sample-core',
    title: 'Build the one feature the demo depends on',
    description: 'Hard-code everything else. If it is not on the demo path, it waits.',
    status: 'backlog',
  },
  {
    id: 'sample-polish',
    title: 'Polish the first 10 seconds of the app',
    description: 'Empty states, loading states, and a clear headline. First impressions carry the judging.',
    status: 'backlog',
  },
  {
    id: 'sample-demo',
    title: 'Record a 2-minute demo video',
    description: 'Problem → live demo → what is next. Record twice; ship the second take.',
    status: 'backlog',
  },
  {
    id: 'sample-submit',
    title: 'Write the README and submission copy',
    description: 'Setup steps, screenshots, tech stack, and the pitch sentence. Submit an hour before the deadline.',
    status: 'backlog',
  },
  {
    id: 'sample-pack',
    title: 'Pack for Goa: charger, adapter, sunscreen',
    description: 'Laptop charger, phone cable, a spare extension board, and something for the beach after you ship.',
    status: 'backlog',
  },
];

export const SAMPLE_IDS = new Set(SEEDS.map((s) => s.id));

export function createSampleTasks(): Task[] {
  const now = Date.now();
  return SEEDS.map((s, i) => ({ ...s, source: 'sample' as const, createdAt: now + i, updatedAt: now + i }));
}
