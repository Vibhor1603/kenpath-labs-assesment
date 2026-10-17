import type { BadgeId, DiscoveryId, Progress, TestOutcome } from "@/content/types";
import { getNewBadges } from "@/lib/badges";
import { calculatePointsForPass, isPerfectScore } from "@/lib/scoring";
import { getStreakAfterPass } from "@/lib/streak";
import { getDayIndex, getNextMaxUnlockedDay } from "@/lib/unlock";

export function createFreshProgress(todayKey: string): Progress {
  return {
    version: 1,
    firstVisitDate: todayKey,
    maxUnlockedDay: 1,
    points: 0,
    streak: { count: 0, lastPerfectDate: null },
    attempts: {},
    collected: {},
    badges: [],
    seenBadges: [],
    settings: { haptics: true, calmMotion: false },
    introDismissed: false,
  };
}

export type ProgressAction =
  | { type: "boot"; todayKey: string }
  | {
      type: "finishTest";
      discoveryId: DiscoveryId;
      score: number;
      todayKey: string;
      nowIso: string;
    }
  | { type: "markBadgesSeen"; badgeIds: BadgeId[] }
  | { type: "setSetting"; key: "haptics" | "calmMotion"; value: boolean }
  | { type: "dismissIntro" }
  | { type: "adoptSnapshot"; snapshot: Progress; todayKey: string };

export function progressReducer(state: Progress, action: ProgressAction): Progress {
  switch (action.type) {
    case "boot": {
      const dayIndex = getDayIndex(state.firstVisitDate, action.todayKey);
      const capped = Math.min(dayIndex, 3) as 1 | 2 | 3;
      return {
        ...state,
        maxUnlockedDay: getNextMaxUnlockedDay(state.maxUnlockedDay, capped),
      };
    }
    case "finishTest": {
      const attemptNumber = (state.attempts[action.discoveryId] ?? 0) + 1;
      const attempts = { ...state.attempts, [action.discoveryId]: attemptNumber };
      let next: Progress = { ...state, attempts };

      if (!isPerfectScore(action.score)) return next;

      const streak = getStreakAfterPass(state.streak, action.todayKey);
      const isFirstCollect = !state.collected[action.discoveryId];
      let points = state.points;
      let collected = state.collected;

      if (isFirstCollect) {
        points += calculatePointsForPass({
          isFirstCollect: true,
          newStreakCount: streak.count,
        });
        collected = {
          ...collected,
          [action.discoveryId]: {
            perfectAt: action.todayKey,
            firstTry: attemptNumber === 1,
          },
        };
      }

      next = { ...next, streak, points, collected };
      const newBadges = getNewBadges(
        next,
        { isPerfect: true, attemptNumber },
        action.nowIso,
      );
      if (newBadges.length > 0) {
        next = { ...next, badges: [...next.badges, ...newBadges] };
      }
      return next;
    }
    case "markBadgesSeen": {
      const seen = new Set([...state.seenBadges, ...action.badgeIds]);
      return { ...state, seenBadges: [...seen] };
    }
    case "setSetting":
      return {
        ...state,
        settings: { ...state.settings, [action.key]: action.value },
      };
    case "dismissIntro":
      return { ...state, introDismissed: true };
    case "adoptSnapshot": {
      const dayIndex = getDayIndex(action.snapshot.firstVisitDate, action.todayKey);
      const capped = Math.min(dayIndex, 3) as 1 | 2 | 3;
      return {
        ...action.snapshot,
        maxUnlockedDay: getNextMaxUnlockedDay(action.snapshot.maxUnlockedDay, capped),
        settings: state.settings,
        introDismissed: state.introDismissed || action.snapshot.introDismissed,
        seenBadges: [
          ...new Set([...state.seenBadges, ...action.snapshot.badges.map((b) => b.id)]),
        ],
      };
    }
    default:
      return state;
  }
}

export function getTestOutcome(
  before: Progress,
  after: Progress,
  discoveryId: DiscoveryId,
): TestOutcome {
  const attemptNumber = after.attempts[discoveryId] ?? 0;
  const wasCollected = Boolean(before.collected[discoveryId]);
  const isNowCollected = Boolean(after.collected[discoveryId]);
  const perfect =
    after.points > before.points ||
    (isNowCollected && !wasCollected) ||
    after.streak.lastPerfectDate !== before.streak.lastPerfectDate;

  const newBadges = after.badges.filter((b) => !before.badges.some((x) => x.id === b.id));

  return {
    isPerfect: perfect,
    pointsEarned: after.points - before.points,
    newBadges,
    streakBefore: before.streak.count,
    streakAfter: after.streak.count,
    isFirstCollect: isNowCollected && !wasCollected,
    attemptNumber,
  };
}
