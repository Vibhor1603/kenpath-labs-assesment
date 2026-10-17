/** Design tokens. Hex values are the source of truth; globals.css carries the OKLCH equivalents. */

export const palette = {
  canvas: "#F3F0EA",
  surface: "#FFFDF8",
  sunk: "#E9E4DA",
  line: "#DDD6C8",
  lineStrong: "#C9C0AE",
  ink: "#17181C",
  inkSoft: "#575C66",
  brass: "#B5832F",
  brassInk: "#8A5F17",
  brassTint: "#F4E7CC",
  correct: "#1D6B4B",
  correctTint: "#E2EFE6",
  wrong: "#A8392D",
  wrongTint: "#F6E3DF",
  tech: "#2C6680",
  nature: "#386B43",
  body: "#A23A4D",
} as const;

/** Colours used inside the illustrations (never as text). */
export const artPalette = {
  hotGas: "#E0573C",
  warmLiquid: "#E9A15B",
  veryCold: "#2F86A6",
  coolGas: "#8DBBD0",
  heat: "#E0573C",
  bloodRich: "#C23B3B",
  bloodPoor: "#7E6A9A",
  water: "#3D8FB0",
  sugar: "#D9A23A",
} as const;

/** Contrast pairs with measured ratios and WCAG floors (checked in tests/unit/contrast.test.ts). */
export const contrastPairs = [
  { name: "ink/canvas", fg: palette.ink, bg: palette.canvas, stated: 15.6, floor: 4.5 },
  {
    name: "inkSoft/canvas",
    fg: palette.inkSoft,
    bg: palette.canvas,
    stated: 5.9,
    floor: 4.5,
  },
  {
    name: "inkSoft/surface",
    fg: palette.inkSoft,
    bg: palette.surface,
    stated: 6.6,
    floor: 4.5,
  },
  {
    name: "inkSoft/sunk",
    fg: palette.inkSoft,
    bg: palette.sunk,
    stated: 5.3,
    floor: 4.5,
  },
  {
    name: "surface/ink (primary button)",
    fg: palette.surface,
    bg: palette.ink,
    stated: 17.45,
    floor: 4.5,
  },
  {
    name: "brassInk/canvas",
    fg: palette.brassInk,
    bg: palette.canvas,
    stated: 4.95,
    floor: 4.5,
  },
  {
    name: "brassInk/surface",
    fg: palette.brassInk,
    bg: palette.surface,
    stated: 5.54,
    floor: 4.5,
  },
  {
    name: "correct/surface",
    fg: palette.correct,
    bg: palette.surface,
    stated: 6.34,
    floor: 4.5,
  },
  {
    name: "wrong/surface",
    fg: palette.wrong,
    bg: palette.surface,
    stated: 6.28,
    floor: 4.5,
  },
  {
    name: "tech/surface",
    fg: palette.tech,
    bg: palette.surface,
    stated: 6.22,
    floor: 4.5,
  },
  {
    name: "nature/surface",
    fg: palette.nature,
    bg: palette.surface,
    stated: 6.16,
    floor: 4.5,
  },
  {
    name: "body/surface",
    fg: palette.body,
    bg: palette.surface,
    stated: 6.36,
    floor: 4.5,
  },
  {
    name: "brass/canvas",
    fg: palette.brass,
    bg: palette.canvas,
    stated: 2.95,
    floor: 3.0,
    mustFailAsText: true,
  },
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
  frameWidth: 430,
  frameRadius: 32,
} as const;

export const swipe = {
  offsetPx: 60,
  velocity: 0.4,
  elastic: 0.18,
} as const;

export const STORAGE_KEY = "kenpath-museum-v1";
export const SYNC_STORAGE_KEY = "kenpath-museum-v1-sync";
export const DEMO_STORAGE_KEY = "kenpath-demo";
export const AUTH_STORAGE_KEY = "kenpath-auth";
