import { useEffect, useId, useRef, useState } from 'react';
import type { Status, Task } from '../types';
import { STATUS_LABEL } from '../types';

interface TaskCardProps {
  task: Task;
  prev: Status | null;
  next: Status | null;
  highlighted: boolean;
  shouldFocus: boolean;
  dropBefore: boolean;
  dragging: boolean;
  onFocused: () => void;
  onMove: (id: string, to: Status) => void;
  onUpdate: (id: string, patch: { title: string; description: string }) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverCard: (id: string, placeAfter: boolean) => void;
}

const MOVE_COPY: Record<Status, { back: string; forward: string }> = {
  backlog: { back: '', forward: 'Start' },
  progress: { back: 'Backlog', forward: 'Ship it' },
  shipped: { back: 'Reopen', forward: '' },
};

const SOURCE_LABEL: Record<Task['source'], string> = {
  sample: 'Starter',
  idea: 'From an idea',
  manual: 'Added by you',
};

export function TaskCard(props: TaskCardProps) {
  const { task, prev, next, highlighted, shouldFocus, dropBefore, dragging, onFocused } = props;
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [error, setError] = useState('');
  const cardRef = useRef<HTMLElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  const titleId = useId();
  const errorId = useId();

  // After a move the card re-mounts in another column; pull focus to it so keyboard users stay oriented.
  useEffect(() => {
    if (!shouldFocus) return;
    cardRef.current?.focus({ preventScroll: true });
    cardRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    onFocused();
  }, [shouldFocus, onFocused]);

  useEffect(() => {
    if (editing) titleInputRef.current?.select();
    else if (returnFocus.current) {
      returnFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [editing]);

  const startEdit = () => {
    setTitle(task.title);
    setDescription(task.description);
    setError('');
    setEditing(true);
  };

  const cancel = () => {
    returnFocus.current = true;
    setEditing(false);
  };

  const save = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError('A task needs a title.');
      titleInputRef.current?.focus();
      return;
    }
    props.onUpdate(task.id, { title: trimmed, description: description.trim() });
    returnFocus.current = true;
    setEditing(false);
  };

  const onCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (editing || !e.altKey) return;
    if (e.key === 'ArrowRight' && next) {
      e.preventDefault();
      props.onMove(task.id, next);
    } else if (e.key === 'ArrowLeft' && prev) {
      e.preventDefault();
      props.onMove(task.id, prev);
    }
  };

  const className = [
    'card',
    `card--${task.status}`,
    highlighted && 'card--new',
    dropBefore && 'card--drop-before',
    dragging && 'card--dragging',
    editing && 'card--editing',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      ref={cardRef}
      className={className}
      tabIndex={-1}
      aria-labelledby={titleId}
      draggable={!editing}
      onKeyDown={onCardKeyDown}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
        props.onDragStart(task.id);
      }}
      onDragEnd={props.onDragEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';
        const rect = e.currentTarget.getBoundingClientRect();
        props.onDragOverCard(task.id, e.clientY > rect.top + rect.height / 2);
      }}
    >
      {editing ? (
        <form
          className="card__edit"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              cancel();
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              save();
            }
          }}
        >
          <h3 id={titleId} className="sr-only">
            Editing {task.title}
          </h3>
          <label className="field">
            <span className="field__label">Title</span>
            <input
              ref={titleInputRef}
              className="input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              maxLength={160}
            />
          </label>
          {error && (
            <p id={errorId} className="field-error" role="alert">
              {error}
            </p>
          )}
          <label className="field">
            <span className="field__label">Notes</span>
            <textarea
              className="input input--area"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Context, acceptance criteria, links…"
            />
          </label>
          <div className="card__edit-actions">
            <span className="card__edit-hint">Esc to cancel</span>
            <button type="button" className="btn btn--ghost btn--sm" onClick={cancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary btn--sm">
              Save
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="card__top">
            <span className="card__grip" aria-hidden="true" title="Drag to move">
              <svg viewBox="0 0 8 14" width="8" height="14">
                <circle cx="2" cy="2" r="1.2" />
                <circle cx="6" cy="2" r="1.2" />
                <circle cx="2" cy="7" r="1.2" />
                <circle cx="6" cy="7" r="1.2" />
                <circle cx="2" cy="12" r="1.2" />
                <circle cx="6" cy="12" r="1.2" />
              </svg>
            </span>
            <span className={`tag tag--${task.source}`}>{SOURCE_LABEL[task.source]}</span>
            {task.status === 'shipped' && (
              <span className="card__stamp" aria-hidden="true">
                Shipped
              </span>
            )}
          </div>
          <h3 id={titleId} className="card__title">
            {task.title}
          </h3>
          {task.description && <p className="card__desc">{task.description}</p>}

          <div className="card__actions">
            <div className="card__move">
              {prev && (
                <button
                  type="button"
                  className="btn btn--chip"
                  onClick={() => props.onMove(task.id, prev)}
                  aria-label={`Move “${task.title}” to ${STATUS_LABEL[prev]}`}
                  title={`Move to ${STATUS_LABEL[prev]} (Alt + Left arrow)`}
                >
                  <span aria-hidden="true">←</span> {MOVE_COPY[task.status].back}
                </button>
              )}
              {next && (
                <button
                  type="button"
                  className={`btn btn--chip btn--chip-forward${next === 'shipped' ? ' btn--chip-ship' : ''}`}
                  onClick={() => props.onMove(task.id, next)}
                  aria-label={`Move “${task.title}” to ${STATUS_LABEL[next]}`}
                  title={`Move to ${STATUS_LABEL[next]} (Alt + Right arrow)`}
                >
                  {MOVE_COPY[task.status].forward} <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
            <div className="card__tools">
              <button
                ref={editButtonRef}
                type="button"
                className="icon-btn"
                onClick={startEdit}
                aria-label={`Edit “${task.title}”`}
                title="Edit"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path d="M13.5 3.5l3 3L7 16H4v-3z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={() => props.onDelete(task.id)}
                aria-label={`Delete “${task.title}”`}
                title="Delete"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
                  <path
                    d="M4 6h12M8 6V4h4v2m-6 0 .7 10h6.6L14 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </article>
  );
}
