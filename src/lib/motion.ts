/**
 * Motion timing for the per-step choreography. Curves live in globals.css
 * (--ease-out, --spring-soft, --spring-press, --spring-ui) so the compositor runs them.
 */
export const stepTimeline = {
  cameraMs: 820,
  focusAtMs: 380,
  focusMs: 320,
  labelsAtMs: 620,
  labelStaggerMs: 90,
  titleAtMs: 120,
  wordStaggerMs: 30,
  bodyDelayMs: 140,
  reducedFadeMs: 200,
} as const;

export const reward = {
  totalMs: 1600,
  stampAtMs: 700,
  countAtMs: 750,
  countMs: 650,
  badgeAtMs: 1450,
} as const;

/** Fraction of an entrance duration used for its exit. */
export const exitFactor = 0.7;
