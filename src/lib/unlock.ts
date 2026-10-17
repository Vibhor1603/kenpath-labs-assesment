import type { DayNumber, Discovery, DiscoveryId, Progress } from "@/content/types";
import { daysBetween } from "@/lib/date";

export function getDayIndex(firstVisitDate: string, todayKey: string): number {
  return Math.max(1, daysBetween(firstVisitDate, todayKey) + 1);
}

export function getNextMaxUnlockedDay(
  previousMax: DayNumber,
  dayIndex: number,
): DayNumber {
  const next = Math.min(3, Math.max(previousMax, dayIndex)) as DayNumber;
  return next;
}

export function isDiscoveryUnlocked(
  day: DayNumber,
  maxUnlockedDay: DayNumber,
  isDemo: boolean,
): boolean {
  if (isDemo) return true;
  return day <= maxUnlockedDay;
}

export function getDaysUntilUnlock(day: DayNumber, dayIndex: number): number {
  return Math.max(0, day - dayIndex);
}

export type TodayState = "new" | "collected-waiting" | "all-done";

export type TodaysDiscovery = {
  discovery: Discovery;
  state: TodayState;
};

export function getTodaysDiscovery(
  discoveries: Discovery[],
  progress: Progress,
  isDemo: boolean,
): TodaysDiscovery {
  const dayIndex = getDayIndex(progress.firstVisitDate, toLocalToday());
  const effectiveMax = (isDemo
    ? 3
    : Math.min(3, Math.max(progress.maxUnlockedDay, Math.min(dayIndex, 3)))) as DayNumber;

  const sorted = [...discoveries].sort((a, b) => a.day - b.day);
  const target =
    sorted.find((d) => d.day === effectiveMax) ?? sorted[sorted.length - 1];

  const allCollected = sorted.every((d) => progress.collected[d.id]);
  if (allCollected) {
    return { discovery: target, state: "all-done" };
  }

  if (progress.collected[target.id]) {
    const lowestUncollected = sorted.find(
      (d) =>
        isDiscoveryUnlocked(d.day, progress.maxUnlockedDay, isDemo) &&
        !progress.collected[d.id],
    );
    if (lowestUncollected) {
      return { discovery: lowestUncollected, state: "new" };
    }
    return { discovery: target, state: "collected-waiting" };
  }

  return { discovery: target, state: "new" };
}

function toLocalToday(): string {
  // Callers pass today via progress boot; for helpers that need "now", use Date.
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Prefer this when the caller already has todayKey. */
export function getTodaysDiscoveryForDate(
  discoveries: Discovery[],
  progress: Progress,
  todayKey: string,
  isDemo: boolean,
): TodaysDiscovery {
  const dayIndex = getDayIndex(progress.firstVisitDate, todayKey);
  // Today's featured discovery is min(dayIndex, 3). Demo shows the latest day.
  const todayDay = (isDemo ? 3 : Math.min(dayIndex, 3)) as DayNumber;
  const unlockMax = isDemo
    ? 3
    : getNextMaxUnlockedDay(progress.maxUnlockedDay, todayDay);

  const sorted = [...discoveries].sort((a, b) => a.day - b.day);
  const target =
    sorted.find((d) => d.day === todayDay) ?? sorted[sorted.length - 1];

  const unlocked = (id: DiscoveryId) => {
    const d = sorted.find((x) => x.id === id);
    return d ? isDiscoveryUnlocked(d.day, unlockMax, isDemo) : false;
  };

  const allCollected = sorted.every((d) => progress.collected[d.id]);
  if (allCollected) {
    return { discovery: target, state: "all-done" };
  }

  if (progress.collected[target.id]) {
    const lowestUncollected = sorted.find(
      (d) => unlocked(d.id) && !progress.collected[d.id],
    );
    if (lowestUncollected) {
      return { discovery: lowestUncollected, state: "new" };
    }
    return { discovery: target, state: "collected-waiting" };
  }

  return { discovery: target, state: "new" };
}
