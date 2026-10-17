import type { Streak } from "@/content/types";
import { addDays, daysBetween } from "@/lib/date";

export function getStreakAfterPass(streak: Streak, todayKey: string): Streak {
  const last = streak.lastPerfectDate;
  if (last === todayKey) {
    return streak;
  }
  if (last === addDays(todayKey, -1)) {
    return { count: streak.count + 1, lastPerfectDate: todayKey };
  }
  return { count: 1, lastPerfectDate: todayKey };
}

export function getDisplayedStreak(streak: Streak, todayKey: string): number {
  if (!streak.lastPerfectDate) return 0;
  const gap = daysBetween(streak.lastPerfectDate, todayKey);
  if (gap === 0 || gap === 1) return streak.count;
  return 0;
}

export function isStreakBroken(streak: Streak, todayKey: string): boolean {
  return streak.lastPerfectDate !== null && getDisplayedStreak(streak, todayKey) === 0;
}
