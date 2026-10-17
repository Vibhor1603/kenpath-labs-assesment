export const PERFECT_SCORE = 5;
/** Minimum correct answers to collect an exhibit and unlock the next day. */
export const PASS_SCORE = 4;
/** Points for adding a new exhibit to the museum (before streak). */
export const BASE_POINTS = 200;
export const BONUS_PER_DAY = 50;
export const BONUS_CAP = 200;
/** Points per correct answer on a failed attempt (below PASS_SCORE). */
export const EFFORT_PER_CORRECT = 15;
/** Once-per-day bonus for a passing revisit of an already collected exhibit. */
export const REVISIT_BONUS = 75;

export type PointsBreakdown = {
  discovery: number;
  streak: number;
  effort: number;
  revisit: number;
};

export function emptyBreakdown(): PointsBreakdown {
  return { discovery: 0, streak: 0, effort: 0, revisit: 0 };
}

export function isPerfectScore(score: number): boolean {
  return score === PERFECT_SCORE;
}

/** 4 of 5 or better unlocks the museum slot and day progression. */
export function isPassingScore(score: number): boolean {
  return score >= PASS_SCORE;
}

export function calculateStreakBonus(count: number): number {
  return Math.min(BONUS_PER_DAY * count, BONUS_CAP);
}

export function calculateEffortPoints(score: number): number {
  const correct = Math.max(0, Math.min(PERFECT_SCORE, Math.floor(score)));
  return correct * EFFORT_PER_CORRECT;
}

export function calculatePointsForPass(args: {
  isFirstCollect: boolean;
  newStreakCount: number;
}): number {
  if (!args.isFirstCollect) return 0;
  return BASE_POINTS + calculateStreakBonus(args.newStreakCount);
}

export function calculateRevisitBonus(args: {
  alreadyCollected: boolean;
  isPassing: boolean;
  lastClaimDate: string | null | undefined;
  todayKey: string;
}): number {
  if (!args.alreadyCollected || !args.isPassing) return 0;
  if (args.lastClaimDate === args.todayKey) return 0;
  return REVISIT_BONUS;
}

export function breakdownForCollect(newStreakCount: number): PointsBreakdown {
  return {
    discovery: BASE_POINTS,
    streak: calculateStreakBonus(newStreakCount),
    effort: 0,
    revisit: 0,
  };
}

export function breakdownForEffort(score: number): PointsBreakdown {
  return { ...emptyBreakdown(), effort: calculateEffortPoints(score) };
}

export function breakdownForRevisit(): PointsBreakdown {
  return { ...emptyBreakdown(), revisit: REVISIT_BONUS };
}

export function sumBreakdown(b: PointsBreakdown): number {
  return b.discovery + b.streak + b.effort + b.revisit;
}
