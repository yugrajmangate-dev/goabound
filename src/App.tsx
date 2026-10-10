import { useCallback, useEffect, useRef, useState } from 'react';
import { WaveRule } from './components/Emblem';
import { FocusTimer } from './components/FocusTimer';
import { Header } from './components/Header';
import { IdeaCapture, type IdeaCaptureHandle, type IdeaMode } from './components/IdeaCapture';
import { ProgressSummary } from './components/ProgressSummary';
import { TaskBoard } from './components/TaskBoard';
import { Toasts } from './components/Toasts';
import { useNow } from './hooks/useNow';
import { useToasts } from './hooks/useToasts';
import { createSampleTasks, SAMPLE_IDS } from './sampleTasks';
import { loadTasks, saveTasks } from './storage';
import type { Status, Task } from './types';
import { STATUS_LABEL } from './types';
import { ideaToTask, ideaToTasks, uid } from './utils';

interface Removed {
  task: Task;
  index: number;
}

/** Put removed tasks back at their original positions (skipping any that already exist). */
function reinsert(list: Task[], removed: Removed[]): Task[] {
  const next = [...list];
  const existing = new Set(list.map((t) => t.id));
  [...removed]
    .sort((a, b) => a.index - b.index)
    .forEach(({ task, index }) => {
      if (existing.has(task.id)) return;
      next.splice(Math.min(index, next.length), 0, task);
    });
  return next;
}

const short = (title: string) => (title.length > 48 ? `${title.slice(0, 46)}…` : title);

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const { toasts, push, dismiss } = useToasts();
  const ideaRef = useRef<IdeaCaptureHandle>(null);
  const now = useNow(1000);

  useEffect(() => saveTasks(tasks), [tasks]);

  useEffect(() => {
    if (!highlightId) return;
    const id = window.setTimeout(() => setHighlightId(null), 2400);
    return () => window.clearTimeout(id);
  }, [highlightId]);

  const handleFocusHandled = useCallback(() => setFocusId(null), []);

  const addIdea = (text: string, mode: IdeaMode): number => {
    const drafts = mode === 'split' ? ideaToTasks(text) : [ideaToTask(text)];
    const valid = drafts.filter((d) => d.title);
    if (valid.length === 0) return 0;
    const t = Date.now();
    const created: Task[] = valid.map((d, i) => ({
      id: uid(),
      title: d.title,
      description: d.description,
      status: 'backlog',
      source: 'idea',
      createdAt: t + i,
      updatedAt: t + i,
    }));
    // Newest ideas go to the top of the Backlog so they are visible immediately.
    setTasks((prev) => [...created, ...prev]);
    setHighlightId(created[0].id);
    push(
      created.length === 1
        ? `Idea captured — “${short(created[0].title)}” is now in Backlog.`
        : `${created.length} tasks added to Backlog from your idea.`,
      {
        action: {
          label: 'Undo',
          onAction: () => setTasks((prev) => prev.filter((x) => !created.some((c) => c.id === x.id))),
        },
      },
    );
    return created.length;
  };

  const addTask = (status: Status, title: string, description: string) => {
    const t = Date.now();
    const task: Task = { id: uid(), title, description, status, source: 'manual', createdAt: t, updatedAt: t };
    setTasks((prev) => [...prev, task]);
    setHighlightId(task.id);
    push(`Added “${short(title)}” to ${STATUS_LABEL[status]}.`);
  };

  const moveTask = (id: string, to: Status, beforeId: string | null = null) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => {
      const current = prev.find((t) => t.id === id);
      if (!current) return prev;
      if (current.status === to && beforeId === id) return prev;
      const moved: Task = { ...current, status: to, updatedAt: Date.now() };
      const rest = prev.filter((t) => t.id !== id);
      const at = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
      if (at === -1) return [...rest, moved];
      rest.splice(at, 0, moved);
      return rest;
    });
    if (task.status !== to) {
      setFocusId(id);
      if (to === 'shipped') {
        setHighlightId(id);
        push(`Shipped! “${short(task.title)}” made it ashore.`);
      } else {
        push(`Moved “${short(task.title)}” to ${STATUS_LABEL[to]}.`, { tone: 'info' });
      }
    }
  };

  const updateTask = (id: string, patch: { title: string; description: string }) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              ...patch,
              // Once you edit a starter task it is yours: "Clear starter tasks" will leave it alone.
              source: t.source === 'sample' ? 'manual' : t.source,
              updatedAt: Date.now(),
            }
          : t,
      ),
    );
    push('Changes saved.');
  };

  const deleteTask = (id: string) => {
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) return;
    const task = tasks[index];
    setTasks((prev) => prev.filter((t) => t.id !== id));
    push(`Deleted “${short(task.title)}”.`, {
      tone: 'warning',
      action: { label: 'Undo', onAction: () => setTasks((prev) => reinsert(prev, [{ task, index }])) },
    });
  };

  const clearSamples = () => {
    const removed: Removed[] = tasks
      .map((task, index) => ({ task, index }))
      .filter(({ task }) => task.source === 'sample');
    if (removed.length === 0) return;
    setTasks((prev) => prev.filter((t) => t.source !== 'sample'));
    push(`Cleared ${removed.length} starter task${removed.length === 1 ? '' : 's'}. Your own tasks are untouched.`, {
      tone: 'info',
      action: { label: 'Undo', onAction: () => setTasks((prev) => reinsert(prev, removed)) },
    });
  };

  const presentIds = new Set(tasks.map((t) => t.id));
  const missingSamples = [...SAMPLE_IDS].filter((id) => !presentIds.has(id)).length;
  const sampleCount = tasks.filter((t) => t.source === 'sample').length;

  const restoreSamples = () => {
    const fresh = createSampleTasks().filter((s) => !presentIds.has(s.id));
    if (fresh.length === 0) {
      push('All starter tasks are already on the board.', { tone: 'info' });
      return;
    }
    setTasks((prev) => [...prev, ...fresh.filter((s) => !prev.some((t) => t.id === s.id))]);
    push(`Restored ${fresh.length} starter task${fresh.length === 1 ? '' : 's'}.`);
  };

  return (
    <>
      <a className="skip-link" href="#board-heading">
        Skip to task board
      </a>
      <div className="focus-bar" aria-hidden="true" />
      <div className="shell">
        <Header now={now} />
        <WaveRule className="wave-rule" />

        <main className="layout">
          <div className="layout__idea">
            <IdeaCapture ref={ideaRef} onSubmit={addIdea} />
          </div>
          <div className="layout__timer">
            <FocusTimer notify={push} />
          </div>
          <div className="layout__progress">
            <ProgressSummary tasks={tasks} now={now} />
          </div>
          <div className="layout__board">
            <TaskBoard
              tasks={tasks}
              highlightId={highlightId}
              focusId={focusId}
              sampleCount={sampleCount}
              missingSampleCount={missingSamples}
              onFocusHandled={handleFocusHandled}
              onMove={moveTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onAdd={addTask}
              onClearSamples={clearSamples}
              onRestoreSamples={restoreSamples}
              onFocusIdea={() => ideaRef.current?.focus()}
            />
          </div>
        </main>

        <footer className="colophon">
          <WaveRule className="wave-rule wave-rule--soft" />
          <p>
            GoaBound keeps everything in this browser’s local storage — no accounts, no servers. Built for solo builders heading
            to Hacker House Goa.
          </p>
        </footer>
      </div>
      <Toasts toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
