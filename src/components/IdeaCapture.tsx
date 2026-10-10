import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from 'react';
import { STORAGE_KEYS } from '../constants';
import { readString, writeString } from '../storage';

export type IdeaMode = 'single' | 'split';

interface IdeaCaptureProps {
  onSubmit: (text: string, mode: IdeaMode) => number;
}

export interface IdeaCaptureHandle {
  focus: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/**
 * The textarea is deliberately *uncontrolled*. Dictation tools such as Wispr Flow insert text by
 * pasting or by writing to the field directly; a controlled React value can ignore or overwrite
 * text that arrives without a React-visible event. Here the DOM is the source of truth: we read
 * `textarea.value` at submit time and only mirror it into state for the counter and draft saving.
 */
export const IdeaCapture = forwardRef<IdeaCaptureHandle, IdeaCaptureProps>(function IdeaCapture({ onSubmit }, ref) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [initialDraft] = useState(() => readString(STORAGE_KEYS.draft));
  const [length, setLength] = useState(initialDraft.trim().length);
  const [lineCount, setLineCount] = useState(() => countLines(initialDraft));
  const [mode, setMode] = useState<IdeaMode>('single');
  const [error, setError] = useState('');
  const hintId = useId();
  const errorId = useId();
  const modeName = useId();

  useImperativeHandle(ref, () => ({ focus: () => textareaRef.current?.focus() }), []);

  const sync = useCallback(() => {
    const value = textareaRef.current?.value ?? '';
    setLength(value.trim().length);
    setLineCount(countLines(value));
    writeString(STORAGE_KEYS.draft, value);
    if (value.trim()) setError('');
  }, []);

  // Listen natively as well as through React so text from any insertion path is picked up.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const deferred = () => window.setTimeout(sync, 0);
    const events = ['input', 'change', 'keyup', 'focus', 'blur', 'compositionend'] as const;
    events.forEach((e) => el.addEventListener(e, sync));
    el.addEventListener('paste', deferred);
    el.addEventListener('drop', deferred);
    // Safety net for tools that set `.value` without firing any event while the field is focused.
    const poll = window.setInterval(() => {
      if (document.activeElement === el) sync();
    }, 750);
    return () => {
      events.forEach((e) => el.removeEventListener(e, sync));
      el.removeEventListener('paste', deferred);
      el.removeEventListener('drop', deferred);
      window.clearInterval(poll);
    };
  }, [sync]);

  const submit = () => {
    const el = textareaRef.current;
    const value = el?.value ?? '';
    if (!value.trim()) {
      setError('Type or dictate an idea first — even a rough sentence works.');
      el?.focus();
      return;
    }
    const added = onSubmit(value, mode);
    if (added > 0 && el) {
      el.value = '';
      sync();
      el.focus();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  const willAdd = mode === 'split' ? Math.max(lineCount, length ? 1 : 0) : length ? 1 : 0;

  return (
    <section className="panel idea" aria-labelledby="idea-heading">
      <div className="panel__head">
        <p className="eyebrow">Plate I · The idea tide</p>
        <h2 id="idea-heading" className="panel__title">
          Catch the idea before it drifts
        </h2>
      </div>

      <form
        className="idea__form"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label htmlFor="idea-input" className="sr-only">
          Your idea
        </label>
        <div className={`idea__field${error ? ' idea__field--error' : ''}`}>
          <textarea
            id="idea-input"
            ref={textareaRef}
            className="idea__textarea"
            defaultValue={initialDraft}
            onKeyDown={onKeyDown}
            placeholder={'Talk it out. “An app that turns voice notes from the beach into a pitch deck…”\n\nOne line per step if you want to split it into tasks.'}
            rows={6}
            spellCheck
            autoComplete="off"
            aria-describedby={`${hintId}${error ? ` ${errorId}` : ''}`}
            aria-invalid={error ? true : undefined}
          />
          <span className="idea__count" aria-hidden="true">
            {length > 0 ? `${length} chars` : 'Draft autosaves'}
          </span>
        </div>
        {error && (
          <p id={errorId} className="field-error" role="alert">
            {error}
          </p>
        )}

        <p id={hintId} className="idea__hint">
          <span className="mic-dot" aria-hidden="true" /> Dictating with Wispr Flow? Click into the box, hold your hotkey and
          speak — the text lands here. Press <kbd>{isMac ? '⌘' : 'Ctrl'}</kbd>+<kbd>Enter</kbd> to add it.
        </p>

        <div className="idea__actions">
          <fieldset className="segmented">
            <legend className="sr-only">How to add this idea</legend>
            <label className={`segmented__opt${mode === 'single' ? ' is-on' : ''}`}>
              <input
                type="radio"
                name={modeName}
                value="single"
                checked={mode === 'single'}
                onChange={() => setMode('single')}
              />
              One task
            </label>
            <label className={`segmented__opt${mode === 'split' ? ' is-on' : ''}`}>
              <input
                type="radio"
                name={modeName}
                value="split"
                checked={mode === 'split'}
                onChange={() => setMode('split')}
              />
              One task per line
            </label>
          </fieldset>
          <button type="submit" className="btn btn--primary">
            <span>
              {willAdd > 1 ? `Add ${willAdd} tasks to Backlog` : 'Add to Backlog'}
            </span>
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
              <path d="M4 10h11m-4-4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
});

function countLines(text: string): number {
  return text.split(/\r?\n/).filter((l) => l.trim()).length;
}
