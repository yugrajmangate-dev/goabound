export type Status = 'backlog' | 'progress' | 'shipped';

export type TaskSource = 'sample' | 'idea' | 'manual' | 'demo';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: Status;
  source: TaskSource;
  createdAt: number;
  updatedAt: number;
}

export interface ColumnMeta {
  id: Status;
  label: string;
  plate: string;
  empty: string;
}

export const COLUMNS: ColumnMeta[] = [
  {
    id: 'backlog',
    label: 'Backlog',
    plate: 'At the jetty',
    empty: 'Nothing waiting. Capture an idea above, add a task, or drag one back here.',
  },
  {
    id: 'progress',
    label: 'In Progress',
    plate: 'Under sail',
    empty: 'Pick one thing from the Backlog and pull it in. One at a time ships faster.',
  },
  {
    id: 'shipped',
    label: 'Shipped',
    plate: 'Landed ashore',
    empty: 'Your first ship lands here. Finish something small to break the seal.',
  },
];

export const STATUS_ORDER: Status[] = ['backlog', 'progress', 'shipped'];

export const STATUS_LABEL: Record<Status, string> = {
  backlog: 'Backlog',
  progress: 'In Progress',
  shipped: 'Shipped',
};
