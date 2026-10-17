/** Design tokens. Hex values are the source of truth; CSS uses OKLCH. */

export const palette = {
  paper: "#FBF5EC",
  sand: "#F1E4D1",
  peach: "#F6C9A8",
  butter: "#F7E3A1",
  sage: "#C9DDB8",
  sky: "#CFE4EC",
  blush: "#F3C6C6",
  lavender: "#D9D0EE",
  softInk: "#5E554D",
  deepInk: "#2B2420",
  kiln: "#A94A1C",
  ember: "#E2703A",
  deepTeal: "#1F6672",
  teal: "#2F7F8C",
  deepBerry: "#A3384B",
  berry: "#C2475B",
  deepLeaf: "#2F6A3B",
  leaf: "#3E7D4A",
} as const;

/** Contrast pairs with stated ratios from the brief and WCAG floors. */
export const contrastPairs = [
  { name: "softInk/paper", fg: palette.softInk, bg: palette.paper, stated: 6.7, floor: 4.5 },
  { name: "softInk/sand", fg: palette.softInk, bg: palette.sand, stated: 5.8, floor: 4.5 },
  { name: "deepInk/paper", fg: palette.deepInk, bg: palette.paper, stated: 14.0, floor: 4.5 },
  { name: "paper/kiln", fg: palette.paper, bg: palette.kiln, stated: 5.3, floor: 4.5 },
  { name: "deepTeal/paper", fg: palette.deepTeal, bg: palette.paper, stated: 6.1, floor: 4.5 },
  { name: "deepBerry/paper", fg: palette.deepBerry, bg: palette.paper, stated: 6.0, floor: 4.5 },
  { name: "deepLeaf/paper", fg: palette.deepLeaf, bg: palette.paper, stated: 6.0, floor: 4.5 },
  { name: "ember/paper", fg: palette.ember, bg: palette.paper, stated: 2.9, floor: 3.0, mustFailAsText: true },
] as const;

export const layout = {
  topBar: 56,
  bottomBar: 72,
  primaryButton: 56,
  iconButton: 48,
  answerCardMin: 64,
  targetMin: 48,
  targetGap: 8,
  stageInset: 16,
  sheetRadius: 24,
  frameWidth: 430,
  frameRadius: 32,
  cardRadius: 16,
} as const;

export const ambient = {
  settleMinMs: 7000,
  settleMaxMs: 11000,
  butterflyMinMs: 12000,
  butterflyMaxMs: 20000,
  holdDoorMs: 400,
} as const;

export const swipe = {
  offsetPx: 60,
  velocity: 400,
  elastic: 0.18,
} as const;

export const STORAGE_KEY = "kenpath-museum-v1";
export const SYNC_STORAGE_KEY = "kenpath-museum-v1-sync";
export const DEMO_STORAGE_KEY = "kenpath-demo";
export const AUTH_STORAGE_KEY = "kenpath-auth";
