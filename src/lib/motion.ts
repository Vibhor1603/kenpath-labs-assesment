export const ease = {
  out: [0.22, 1, 0.36, 1] as const,
  sheet: [0.32, 0.72, 0, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
} as const;

export const spring = {
  ui: { type: "spring" as const, visualDuration: 0.3, bounce: 0.15 },
  press: { type: "spring" as const, visualDuration: 0.2, bounce: 0.3 },
  lift: { type: "spring" as const, visualDuration: 0.35, bounce: 0.25 },
  part: { type: "spring" as const, visualDuration: 0.6, bounce: 0.08 },
  hero: { type: "spring" as const, visualDuration: 0.55, bounce: 0.1 },
} as const;

export const dur = {
  fast: 0.12,
  ui: 0.2,
  label: 0.25,
  text: 0.3,
  sheet: 0.5,
} as const;

export const stepTimeline = {
  partStaggerMs: 50,
  focusAtMs: 450,
  labelsAtMs: 650,
  labelStaggerMs: 80,
  textAtMs: 800,
  bodyDelayMs: 120,
  loopAtMs: 1300,
} as const;

export const reducedCrossfadeS = 0.2;
export const exitFactor = 0.7;

export type ChoreographyPhase = "parts" | "focus" | "labels" | "text" | "loop";
