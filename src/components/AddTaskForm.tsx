import { useEffect, useId, useRef, useState } from 'react';
import type { Status } from '../types';
import { STATUS_LABEL } from '../types';

interface AddTaskFormProps {
  status: Status;
  onAdd: (status: Status, title: string, description: string) => void;
}

export function AddTaskForm({ status, onAdd }: AddTaskFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const errorId = useId();

  useEffect(() => {
    if (open) titleRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  const close = () => {
    setOpen(false);
    setTitle('');
    setDescription('');
    setError('');
  };

  if (!open) {
    return (
      <button ref={toggleRef} type="button" className="add-toggle" onClick={() => setOpen(true)}>
        <span aria-hidden="true">+</span> Add task<span className="sr-only"> to {STATUS_LABEL[status]}</span>
      </button>
    );
  }

  return (
    <form
      className="add-form"
      aria-label={`Add a task to ${STATUS_LABEL[status]}`}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        }
      }}
      onSubmit={(e) => {
        e.preventDefault();
        const t = (titleRef.current?.value ?? title).trim();
        if (!t) {
          setError('Give the task a title.');
          titleRef.current?.focus();
          return;
        }
        onAdd(status, t, description.trim());
        setTitle('');
        setDescription('');
        setError('');
        titleRef.current?.focus();
      }}
    >
      <label className="field">
        <span className="field__label">Task title</span>
        <input
          ref={titleRef}
          className="input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          placeholder="e.g. Wire up the share button"
          maxLength={160}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </label>
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
      <label className="field">
        <span className="field__label">
          Notes <span className="field__optional">optional</span>
        </span>
        <textarea className="input input--area" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="add-form__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={close}>
          Close
        </button>
        <button type="submit" className="btn btn--primary btn--sm">
          Add task
        </button>
      </div>
    </form>
  );
}
