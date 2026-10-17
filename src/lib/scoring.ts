export const PERFECT_SCORE = 5;
export const BASE_POINTS = 100;
export const BONUS_PER_DAY = 20;
export const BONUS_CAP = 100;

export function isPerfectScore(score: number): boolean {
  return score === PERFECT_SCORE;
}

export function calculateStreakBonus(count: number): number {
  return Math.min(BONUS_PER_DAY * count, BONUS_CAP);
}

export function calculatePointsForPass(args: {
  isFirstCollect: boolean;
  newStreakCount: number;
}): number {
  if (!args.isFirstCollect) return 0;
  return BASE_POINTS + calculateStreakBonus(args.newStreakCount);
}
