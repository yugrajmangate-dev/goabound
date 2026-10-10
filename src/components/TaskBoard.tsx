import { useEffect, useState, type ReactNode } from 'react';
import type { Status, Task } from '../types';
import { COLUMNS, STATUS_ORDER } from '../types';
import { AddTaskForm } from './AddTaskForm';
import { Emblem } from './Emblem';
import { LoadDemoBoard } from './LoadDemoBoard';
import { TaskCard } from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  highlightId: string | null;
  focusId: string | null;
  sampleCount: number;
  missingSampleCount: number;
  onFocusHandled: () => void;
  onMove: (id: string, to: Status, beforeId?: string | null) => void;
  onUpdate: (id: string, patch: { title: string; description: string }) => void;
  onDelete: (id: string) => void;
  onAdd: (status: Status, title: string, description: string) => void;
  onClearSamples: () => void;
  onRestoreSamples: () => void;
  onFocusIdea: () => void;
  onCopyReport: () => Promise<boolean>;
  onLoadDemo: () => void;
  saveStatus: ReactNode;
}

interface DropTarget {
  status: Status;
  beforeId: string | null;
}

export function TaskBoard(props: TaskBoardProps) {
  const { tasks } = props;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(id);
  }, [copied]);

  const copyReport = async () => {
    setCopied(await props.onCopyReport());
  };

  const endDrag = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const setTarget = (next: DropTarget) => {
    setDropTarget((cur) => (cur && cur.status === next.status && cur.beforeId === next.beforeId ? cur : next));
  };

  const boardEmpty = tasks.length === 0;

  return (
    <section className="panel board-panel" aria-labelledby="board-heading">
      <div className="board-panel__head">
        <div className="panel__head">
          <p className="eyebrow">Plate II · The voyage board</p>
          <h2 id="board-heading" className="panel__title">
            From jetty to shore
          </h2>
          {props.saveStatus}
        </div>
        <div className="board-panel__tools">
          <p className="board-panel__kbd">
            Drag cards between columns, or use the buttons. Shortcut: <kbd>Alt</kbd>+<kbd>←</kbd>/<kbd>→</kbd> on a card.
          </p>
          <div className="board-panel__sample-actions">
            <button
              type="button"
              className={`btn btn--primary btn--sm report-btn${copied ? ' report-btn--copied' : ''}`}
              onClick={copyReport}
              aria-describedby="report-btn-hint"
            >
              <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                {copied ? (
                  <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <>
                    <rect x="7" y="7" width="9" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M13 4.5H6a2 2 0 0 0-2 2V14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </>
                )}
              </svg>
              {copied ? 'Copied!' : 'Copy progress report'}
            </button>
            <span id="report-btn-hint" className="sr-only">
              Copies a Markdown summary of every task, grouped by status, to your clipboard.
            </span>
            <LoadDemoBoard taskCount={tasks.length} onConfirm={props.onLoadDemo} />
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={props.onClearSamples}
              disabled={props.sampleCount === 0}
              title="Remove starter tasks you have not edited"
            >
              Clear starter tasks{props.sampleCount > 0 ? ` (${props.sampleCount})` : ''}
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={props.onRestoreSamples}
              disabled={props.missingSampleCount === 0}
              title="Bring back any starter tasks that are missing"
            >
              Restore starter tasks
            </button>
          </div>
        </div>
      </div>

      {boardEmpty && (
        <div className="empty-board" role="status">
          <Emblem size={72} />
          <div>
            <h3 className="empty-board__title">A clear horizon.</h3>
            <p className="empty-board__copy">
              Your board is empty — as calm as Palolem at sunrise. Dictate an idea above and it becomes your first task, add one
              straight into a column, or bring back the starter plan.
            </p>
            <div className="empty-board__actions">
              <button type="button" className="btn btn--primary btn--sm" onClick={props.onFocusIdea}>
                Capture an idea
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={props.onRestoreSamples}>
                Restore starter tasks
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="board">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          const idx = STATUS_ORDER.indexOf(col.id);
          const prev = STATUS_ORDER[idx - 1] ?? null;
          const next = STATUS_ORDER[idx + 1] ?? null;
          const isTarget = draggingId !== null && dropTarget?.status === col.id;
          const dropAtEnd = isTarget && dropTarget?.beforeId === null;

          return (
            <section
              key={col.id}
              className={`column column--${col.id}${isTarget ? ' column--target' : ''}`}
              aria-labelledby={`col-${col.id}`}
              onDragOver={(e) => {
                if (!draggingId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setTarget({ status: col.id, beforeId: null });
              }}
              onDragLeave={(e) => {
                const related = e.relatedTarget as Node | null;
                if (!related || !e.currentTarget.contains(related)) {
                  setDropTarget((cur) => (cur?.status === col.id ? null : cur));
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || draggingId;
                if (id) {
                  const beforeId = dropTarget?.status === col.id ? dropTarget.beforeId : null;
                  props.onMove(id, col.id, beforeId);
                }
                endDrag();
              }}
            >
              <header className="column__head">
                <span className="column__dot" aria-hidden="true" />
                <h3 id={`col-${col.id}`} className="column__title">
                  {col.label}
                </h3>
                <span className="column__count" aria-label={`${columnTasks.length} tasks`}>
                  {columnTasks.length}
                </span>
                <span className="column__plate" aria-hidden="true">
                  {col.plate}
                </span>
              </header>

              <AddTaskForm status={col.id} onAdd={props.onAdd} />

              <div className={`column__list${dropAtEnd ? ' column__list--drop-end' : ''}`}>
                {columnTasks.length === 0 ? (
                  <p className="column__empty">{col.empty}</p>
                ) : (
                  columnTasks.map((task, i) => {
                    const after = columnTasks[i + 1]?.id ?? null;
                    return (
                      <TaskCard
                        key={task.id}
                        task={task}
                        prev={prev}
                        next={next}
                        highlighted={props.highlightId === task.id}
                        shouldFocus={props.focusId === task.id}
                        dropBefore={isTarget && dropTarget?.beforeId === task.id && draggingId !== task.id}
                        dragging={draggingId === task.id}
                        onFocused={props.onFocusHandled}
                        onMove={props.onMove}
                        onUpdate={props.onUpdate}
                        onDelete={props.onDelete}
                        onDragStart={setDraggingId}
                        onDragEnd={endDrag}
                        onDragOverCard={(id, placeAfter) => {
                          if (!draggingId) return;
                          setTarget({ status: col.id, beforeId: placeAfter ? after : id });
                        }}
                      />
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
