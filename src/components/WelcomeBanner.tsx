import { DEMO_PROJECT } from '../demoBoard';
import { Emblem } from './Emblem';

interface WelcomeBannerProps {
  onExploreDemo: () => void;
  onDismiss: () => void;
}

/** First-visit orientation: what the app does, where the data lives, and a one-click demo. */
export function WelcomeBanner({ onExploreDemo, onDismiss }: WelcomeBannerProps) {
  return (
    <section className="welcome" aria-labelledby="welcome-title">
      <Emblem size={64} className="welcome__emblem" />
      <div className="welcome__body">
        <p className="eyebrow eyebrow--coral">Welcome aboard</p>
        <h2 id="welcome-title" className="welcome__title">
          Turn one hackathon idea into a shipped submission.
        </h2>
        <ol className="welcome__steps">
          <li>
            <strong>Capture</strong> an idea by typing or dictating. It lands in your Backlog.
          </li>
          <li>
            <strong>Move</strong> tasks from Backlog to In Progress to Shipped, with a 25-minute focus timer.
          </li>
          <li>
            <strong>Share</strong> progress with a one-click Markdown report.
          </li>
        </ol>
        <p className="welcome__privacy">
          <span className="welcome__lock" aria-hidden="true">
            <svg viewBox="0 0 20 20" width="14" height="14">
              <rect x="4" y="9" width="12" height="8" rx="2" fill="currentColor" />
              <path d="M7 9V6.5a3 3 0 0 1 6 0V9" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </span>
          Your board is saved only in this browser on this device. There is no account, nothing is uploaded, and it does
          not sync to other devices. Clearing this site’s data erases it.
        </p>
        <div className="welcome__actions">
          <button type="button" className="btn btn--primary btn--sm" onClick={onExploreDemo}>
            Explore the {DEMO_PROJECT} demo board
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onDismiss}>
            Start with the starter plan
          </button>
        </div>
      </div>
      <button type="button" className="icon-btn welcome__close" onClick={onDismiss} aria-label="Dismiss welcome message">
        <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </section>
  );
}
