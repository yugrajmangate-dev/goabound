interface EmblemProps {
  size?: number;
  className?: string;
}

/** Sun over the Arabian Sea — the GoaBound mark. */
export function Emblem({ size = 56, className }: EmblemProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <circle cx="32" cy="32" r="30" fill="var(--paper)" stroke="var(--ink)" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="var(--ink)" strokeWidth="0.75" strokeDasharray="1.5 2.5" />
      <g stroke="var(--coral)" strokeWidth="2" strokeLinecap="round">
        <line x1="32" y1="12" x2="32" y2="15.5" />
        <line x1="19" y1="17.5" x2="21.3" y2="20" />
        <line x1="45" y1="17.5" x2="42.7" y2="20" />
        <line x1="14" y1="29" x2="17.5" y2="29.5" />
        <line x1="50" y1="29" x2="46.5" y2="29.5" />
      </g>
      <circle cx="32" cy="31" r="10" fill="var(--coral)" />
      <path
        d="M9 37c5.5 0 5.5-3.5 11.5-3.5S26 37 32 37s5.5-3.5 11.5-3.5S49 37 55 37v4.5c-5.5 0-5.5-3.5-11.5-3.5S38 41.5 32 41.5 26.5 38 20.5 38 14.5 41.5 9 41.5z"
        fill="var(--ink)"
      />
      <path
        d="M12 47c4.5 0 5.5-3 10-3s5.5 3 10 3 5.5-3 10-3 5.5 3 10 3"
        fill="none"
        stroke="var(--seaglass-deep)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** A hand-drawn-feeling wave rule used between sections. */
export function WaveRule({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1200 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path
        d="M0 12 C 50 2, 100 2, 150 12 S 250 22, 300 12 S 400 2, 450 12 S 550 22, 600 12 S 700 2, 750 12 S 850 22, 900 12 S 1000 2, 1050 12 S 1150 22, 1200 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
