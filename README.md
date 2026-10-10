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

By default `dist/` uses relative asset paths (`./assets/...`), so it works on any static host or from a sub-folder. To build for a fixed address, set `BASE_PATH`, for example `BASE_PATH=/goabound/ npm run build`. That also adds a `404.html` that sends any unknown URL back to the app.

## Deploying to GitHub Pages (free)

GoaBound is a static site. There's no server, database or sign-in, so GitHub Pages hosts it for free straight from this repository.

**Address:** `https://<owner>.github.io/<repo>/`. For this repo that's **https://yugrajmangate-dev.github.io/goabound/**.

**How it works:** `.github/workflows/deploy-pages.yml` runs on every push to `main`, and can also be run by hand from the Actions tab. It installs dependencies with `npm ci`, builds with `BASE_PATH=/<repo>/`, and publishes `dist/` with GitHub's official Pages actions. It needs no secrets or tokens.

**One-time setup:**
1. Push this project, including `.github/workflows/deploy-pages.yml`, to `main`.
2. On GitHub, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Open the **Actions** tab, wait for "Deploy to GitHub Pages" to go green, then open the URL shown in the deploy step.

The CLI equivalent of step 2 is `gh api -X POST repos/<owner>/<repo>/pages -f build_type=workflow`.

**What's handled for static hosting:**
- **Direct loads and refreshes:** the app is a single page at `/<repo>/`. Opening or refreshing that URL, or `/<repo>/index.html`, always works. GitHub Pages adds the trailing slash to `/<repo>` itself.
- **Unknown URLs** such as `/<repo>/anything/else` are served the generated `404.html`, which immediately redirects to `/<repo>/`, keeping any `?query` and `#hash`. Visitors land on their board instead of a dead end.
- **Asset paths:** scripts, styles, fonts and the favicon are all built under `/<repo>/`, and the fonts are bundled, so nothing loads from another site.

**Repo renamed, or using a custom domain?**
- If the repo is renamed, the workflow picks up the new name automatically.
- For a custom domain or a `<user>.github.io` repository, the site lives at `/`. Change the build step to `BASE_PATH: /`.

**Other hosts (Netlify, Vercel, Cloudflare Pages):** use build command `npm run build` and output directory `dist`. The default relative paths work as they are.

**Testing the hosted build locally:**

```bash
BASE_PATH=/goabound/ npm run build
BASE_PATH=/goabound/ npx vite preview   # then open http://localhost:4173/goabound/
```

On Windows Git Bash, prefix the build with `MSYS_NO_PATHCONV=1`, or Git Bash rewrites `/goabound/` into a Windows path.

`vite preview` serves `index.html` for unknown paths itself. To see real GitHub Pages behaviour (status codes and the `404.html` redirect), check the deployed site.

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

### Copy progress report
- The **Copy progress report** button, at the top of the task board, copies a Markdown summary of your current board to the clipboard.
- The report has a heading, when it was generated, the days left to kickoff, overall progress (shipped / total and %), and every task **grouped by status** (Backlog, In Progress, Shipped). Each task shows its title and, where you've added any, its notes. Shipped tasks are ticked checkboxes (`- [x]`); open tasks are unticked (`- [ ]`). Empty columns say _No tasks._
- After copying, the button briefly changes to **Copied!** and a notification confirms how many tasks were copied. If the browser blocks clipboard access, a warning appears instead.
- It's a normal button: Tab to it and press **Enter** or **Space**. Focus stays on the button after copying.
- It runs entirely in the browser. It uses the Clipboard API, and falls back to a local copy method when the page is served over plain `http://` on a LAN, where the Clipboard API isn't available. Nothing is uploaded.
- Paste it into GitHub, Notion, Slack, Discord, or a Devpost or Devfolio update.

Example output:

```markdown
# GoaBound progress report

_Generated Saturday, October 10, 2026 at 09:51 PM · 17 days to Hacker House Goa_

**Progress:** 1 of 8 tasks shipped (13%) · Backlog: 5 · In Progress: 2 · Shipped: 1

## Backlog (5)

- [ ] **Build the one feature the demo depends on**
  Hard-code everything else. If it is not on the demo path, it waits.

## In Progress (2)

- [ ] **Write the one-sentence pitch**
  Who is it for, what pain does it remove, and why now? Keep it under 20 words.

## Shipped (1)

- [x] **Scaffold the repo and deploy a hello-world**
  A live URL on day one removes the scariest unknown.
```

### Load demo board
- The **Load demo board** button, at the top of the task board next to **Copy progress report**, fills the board with a small example project, **TideTalk**: voice notes from beach clean-ups turned into shareable impact reports.
- The demo has 8 tasks: 3 in Backlog, 2 in In Progress and 3 in Shipped. Each has realistic notes, and several include a "Try it" tip that walks you through the app (editing, Alt + →, drag-and-drop, Reopen, Copy progress report). Demo cards are tagged **Demo**.
- **There's a confirmation step before anything is replaced.** Clicking the button opens a small panel that says how many tasks will be replaced, with **Keep my board** and **Replace with demo** buttons. If your board is empty, it simply offers to load the demo.
- **Your data is protected:**
  - The success notification has an **Undo** button that brings your previous board back exactly as it was.
  - Before replacing, your current board is also saved under `goabound:v1:board-backup` in localStorage.
  - The demo board is then saved like any other board (`goabound:v1:tasks`), so it survives reloads, and you can edit, move or delete demo tasks normally.
- **Keyboard:** Tab to **Load demo board** and press Enter or Space. Focus moves to **Keep my board**, the safe choice. Tab once to reach **Replace with demo**. **Esc** or **Keep my board** closes the panel, and focus returns to the button.

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

**Each visitor's board lives only in their own browser**, in `localStorage` on that device. There is no backend, no account, no analytics and no sync: someone who opens the hosted site on their phone and on their laptop has two separate boards. Clearing site data for the page erases the board, so use **Copy progress report** to keep a copy.

The app makes this visible:
- **First visit:** a welcome panel explains what GoaBound does and where data lives, and offers the TideTalk demo board or the starter plan. It's shown once, and dismissing it is remembered.
- **Always:** under the board title, **"Saved in this browser · <time>"** shows the last successful save, with "Only on this device. Nothing is uploaded or synced."
- **If saving fails** (storage blocked, private mode, or full), the indicator turns to **"Not saved"** and a warning explains that the board only lasts for this tab.

**Damaged or unexpected data never crashes the app or silently wipes a board:**
- Tasks with a bad or missing status, source, notes or timestamps, or with duplicate IDs, are repaired. Entries with no usable title are set aside.
- Data that can't be read as a board at all opens an empty board instead of a guessed one.
- In both cases the **untouched original** is first copied to `goabound:v1:tasks-recovery`, and a notice explains what happened. If even that copy can't be written (storage full), the original is left in place and not overwritten.
- Timer and session values with the wrong type fall back to defaults.
- With several tabs open, an edit in one tab appears in the others.

**Storage keys** (all `goabound:v1:*`): `tasks`, `idea-draft`, `timer`, `focus-sessions`, `welcome-dismissed`, `board-backup` (the board from just before the demo board was last loaded), and `tasks-recovery` (the original of any damaged data).

## Customising

- Event name and date: `src/constants.ts` (`EVENT_NAME`, `EVENT_START`).
- Timer length: `FOCUS_MINUTES` in `src/constants.ts`.
- Starter tasks: `src/sampleTasks.ts`.
- Colours and type: CSS variables at the top of `src/styles.css`.

## Project structure

```
.github/workflows/
  deploy-pages.yml        build + publish to GitHub Pages
vite.config.ts            BASE_PATH support + 404.html fallback
src/
  App.tsx                 state, task actions, layout
  components/
    Header.tsx            masthead, date, countdown
    IdeaCapture.tsx       dictation-friendly idea box
    TaskBoard.tsx         columns, drag-and-drop, report + sample controls, empty state
    TaskCard.tsx          a card: view, edit, move, delete
    AddTaskForm.tsx       per-column quick add
    FocusTimer.tsx        25-minute timer
    ProgressSummary.tsx   counts, percentage, tide bar
    LoadDemoBoard.tsx     demo-board button with confirmation step
    WelcomeBanner.tsx     first-visit welcome + privacy note
    StorageNotices.tsx    "Saved in this browser" status and recovery notice
    Toasts.tsx            notifications with undo
    Emblem.tsx            SVG mark and wave rule
  hooks/                  useNow, useToasts
  report.ts               Markdown progress report + clipboard copy
  demoBoard.ts            TideTalk demo project tasks
  storage.ts              safe localStorage helpers, repair + recovery of damaged data
  sampleTasks.ts          starter tasks
  utils.ts                idea → task parsing, ids, formatting
```
