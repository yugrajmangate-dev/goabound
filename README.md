# GoaBound: Builder Mission Control

A browser app for solo builders that turns a hackathon idea into a finished submission before **Hacker House Goa (28 October 2026)**.

It's built with React, TypeScript, and Vite. All data stays in your browser's `localStorage`. There's no backend, no sign-in, no paid services, and no external APIs. Fonts are bundled from npm, so the app makes no network requests at runtime.

## Setup

Requirements: **Node.js 18+** (tested on Node 24) and npm.

```bash
cd GoaBound
npm install        # install dependencies
npm run dev        # start the dev server, usually http://localhost:5173
```

Production build:

```bash
npm run build      # type-check with tsc, then bundle into dist/
npm run preview    # serve the built app locally
```

`dist/` uses relative asset paths, so you can host it on any static host: GitHub Pages, Netlify, Vercel, or a USB stick plus `npx serve dist`.

## Features

### 1. Header with live countdown
- App name and today's date, in your locale.
- A live countdown (days, hours, minutes, seconds) to **Hacker House Goa, 28 Oct 2026, 00:00 IST**. When the event starts, the countdown is replaced by a "now underway" message.

### 2. Idea capture (works with Wispr Flow)
- A large, lined text box for typing or dictating.
- **Works with Wispr Flow and other dictation tools.** The text box is uncontrolled: the app reads whatever is in the field when you submit, instead of relying on React state. It also listens for native `input`, `paste`, `change`, `keyup`, and `composition` events, and checks the field while it's focused. So text inserted by pasting, by simulated keystrokes, or by writing to the field directly is always captured.
- **One task** mode: long, run-on dictation becomes a short title (cut at the first sentence or a word boundary), and the full text goes into the notes.
- **One task per line** mode: each line or bullet becomes its own Backlog task.
- Submit with the button or **Ctrl/⌘ + Enter**. Your draft autosaves, so a reload won't lose half-dictated text.

### 3. Task board
- **Backlog → In Progress → Shipped** columns.
- Add a task to any column with the **+ Add task** button.
- **Edit** the title and notes inline. Esc cancels, Ctrl/⌘ + Enter saves.
- **Move** tasks with the buttons (Start, Ship it, Backlog, Reopen), by **drag-and-drop** (drop on a card to place it before or after that card, or on the column to add it at the end), or with the keyboard: **Alt + ← / →** on a focused card.
- **Delete** a task, with **Undo** in the confirmation message.

### 4. Focus timer
- A 25-minute timer with Start, Pause/Resume, and Reset.
- While it runs, the dial turns sea-glass and gently breathes, a pulsing "Focusing" dot appears, an animated tide bar runs across the top of the page, and the browser tab title shows the remaining time.
- It uses wall-clock time, so it stays accurate when the tab sleeps or reloads. When a session ends, it plays a soft chime (generated in the browser), shows a notification, and counts the session ("2 sessions today").

### 5. Progress summary
- Totals for each column, plus a **completion percentage** (shipped ÷ total) that updates as tasks move.
- A stacked "tide" bar, an encouraging status line, and a pace estimate: how many tasks per day to finish before kickoff. You get a warning if too many tasks are in progress at once.

### 6. Starter tasks
- On your first visit, the board is seeded with eight useful hackathon tasks: pitch, core feature, demo video, README, packing for Goa, and so on.
- **Clear starter tasks** removes only the starter tasks you haven't edited, and can be undone. Once you edit a starter task, it counts as yours.
- **Restore starter tasks** brings back any that are missing.

### 7. Empty states, feedback, and accessibility
- Empty board and empty column states that tell you what to do next.
- Notifications for every action (captured, moved, shipped, saved, deleted, cleared), with Undo where it makes sense.
- Every control is a real button or form field and is reachable by keyboard, with visible focus rings, a skip link, ARIA labels on icon buttons, and screen-reader announcements for status changes.
- Respects `prefers-reduced-motion`. The layout adapts down to phone widths.

## Data and privacy

Everything is stored under `goabound:v1:*` keys in `localStorage` (tasks, the idea draft, the timer, and today's session count). To start completely fresh, clear this site's data in your browser. If storage is unavailable, for example in some private modes, the app still works for the current session.

## Customising

- Event name and date: `src/constants.ts` (`EVENT_NAME`, `EVENT_START`).
- Timer length: `FOCUS_MINUTES` in `src/constants.ts`.
- Starter tasks: `src/sampleTasks.ts`.
- Colours and type: CSS variables at the top of `src/styles.css`.

## Project structure

```
src/
  App.tsx                 state, task actions, layout
  components/
    Header.tsx            masthead, date, countdown
    IdeaCapture.tsx       dictation-friendly idea box
    TaskBoard.tsx         columns, drag-and-drop, sample controls, empty state
    TaskCard.tsx          a card: view, edit, move, delete
    AddTaskForm.tsx       per-column quick add
    FocusTimer.tsx        25-minute timer
    ProgressSummary.tsx   counts, percentage, tide bar
    Toasts.tsx            notifications with undo
    Emblem.tsx            SVG mark and wave rule
  hooks/                  useNow, useToasts
  storage.ts              safe localStorage helpers
  sampleTasks.ts          starter tasks
  utils.ts                idea → task parsing, ids, formatting
```
