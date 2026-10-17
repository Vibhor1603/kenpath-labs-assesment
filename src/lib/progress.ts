import type { BadgeId, DiscoveryId, Progress, TestOutcome } from "@/content/types";
import { addDays } from "@/lib/date";
import { getNewBadges } from "@/lib/badges";
import {
  breakdownForCollect,
  breakdownForEffort,
  breakdownForRevisit,
  calculateEffortPoints,
  calculatePointsForPass,
  calculateRevisitBonus,
  emptyBreakdown,
  isPassingScore,
  isPerfectScore,
} from "@/lib/scoring";
import { getStreakAfterPass } from "@/lib/streak";
import { getDayIndex, getNextMaxUnlockedDay } from "@/lib/unlock";

/** Empty museum (day 1, nothing collected). Used in unit tests. */
export function createBlankProgress(todayKey: string): Progress {
  return {
    version: 1,
    firstVisitDate: todayKey,
    maxUnlockedDay: 1,
    points: 0,
    spentPoints: 0,
    redemptions: [],
    streak: { count: 0, lastPerfectDate: null },
    attempts: {},
    collected: {},
    revisitClaimed: {},
    badges: [],
    seenBadges: [],
    settings: {
      haptics: true,
      calmMotion: false,
      darkMode: false,
      hinglish: false,
    },
    introDismissed: false,
  };
}

/**
 * Assessment showcase: fridge done two days ago, leaf yesterday, heart today.
 * Fresh installs see a lived-in museum so reviewers can open Day A immediately.
 */
export function createShowcaseProgress(todayKey: string): Progress {
  const dayAMinus2 = addDays(todayKey, -2);
  const dayAMinus1 = addDays(todayKey, -1);
  return {
    version: 1,
    firstVisitDate: dayAMinus2,
    maxUnlockedDay: 3,
    points: 550,
    spentPoints: 0,
    redemptions: [],
    streak: { count: 2, lastPerfectDate: dayAMinus1 },
    attempts: { fridge: 1, leaf: 1 },
    collected: {
      fridge: { perfectAt: dayAMinus2, firstTry: true, score: 5 },
      leaf: { perfectAt: dayAMinus1, firstTry: true, score: 4 },
    },
    revisitClaimed: {},
    badges: [
      { id: "first-discovery", earnedAt: `${dayAMinus2}T10:00:00.000Z` },
      { id: "perfect-scholar", earnedAt: `${dayAMinus2}T10:00:00.000Z` },
    ],
    seenBadges: ["first-discovery", "perfect-scholar"],
    settings: {
      haptics: true,
      calmMotion: false,
      darkMode: false,
      hinglish: false,
    },
    introDismissed: true,
  };
}

/** Default first paint for the Ken assessment build. */
export function createFreshProgress(todayKey: string): Progress {
  return createShowcaseProgress(todayKey);
}

export type ProgressAction =
  | { type: "boot"; todayKey: string }
  | {
      type: "finishTest";
      discoveryId: DiscoveryId;
      score: number;
      todayKey: string;
      nowIso: string;
      /** When true (server wallet), museum updates but points stay server-owned. */
      skipPointCredit?: boolean;
    }
  | { type: "markBadgesSeen"; badgeIds: BadgeId[] }
  | {
      type: "setSetting";
      key: "haptics" | "calmMotion" | "darkMode" | "hinglish";
      value: boolean;
    }
  | { type: "dismissIntro" }
  | {
      type: "redeemShopItem";
      itemId: string;
      username: string;
      nowIso: string;
      code: string;
      cost: number;
    }
  | {
      type: "syncWallet";
      pointsEarned: number;
      pointsSpent: number;
      redemptions?: Progress["redemptions"];
    }
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
      const passing = isPassingScore(action.score);
      let points = state.points;
      let next: Progress = {
        ...state,
        attempts,
        revisitClaimed: { ...state.revisitClaimed },
      };

      if (!passing) {
        if (!action.skipPointCredit) {
          points += calculateEffortPoints(action.score);
        }
        next = { ...next, points };
        const newBadges = getNewBadges(
          next,
          {
            isPerfect: false,
            isPassing: false,
            attemptNumber,
            score: action.score,
            isRevisitBonus: false,
          },
          action.nowIso,
        );
        if (newBadges.length > 0) {
          next = { ...next, badges: [...next.badges, ...newBadges] };
        }
        return next;
      }

      const streak = getStreakAfterPass(state.streak, action.todayKey);
      const isFirstCollect = !state.collected[action.discoveryId];
      let collected = state.collected;

      if (isFirstCollect) {
        if (!action.skipPointCredit) {
          points += calculatePointsForPass({
            isFirstCollect: true,
            newStreakCount: streak.count,
          });
        }
        collected = {
          ...collected,
          [action.discoveryId]: {
            perfectAt: action.todayKey,
            firstTry: attemptNumber === 1,
            score: action.score,
          },
        };
      } else {
        // Keep the best score on the placard.
        const prev = state.collected[action.discoveryId]!;
        collected = {
          ...collected,
          [action.discoveryId]: {
            ...prev,
            score: Math.max(prev.score ?? 0, action.score),
          },
        };
      }

      const revisit = action.skipPointCredit
        ? 0
        : calculateRevisitBonus({
            alreadyCollected: !isFirstCollect,
            isPassing: true,
            lastClaimDate: state.revisitClaimed[action.discoveryId],
            todayKey: action.todayKey,
          });
      const isRevisitBonus = revisit > 0;
      if (isRevisitBonus) {
        points += revisit;
        next.revisitClaimed[action.discoveryId] = action.todayKey;
      }

      next = { ...next, streak, points, collected };
      const newBadges = getNewBadges(
        next,
        {
          isPerfect: isPerfectScore(action.score),
          isPassing: true,
          attemptNumber,
          score: action.score,
          isRevisitBonus,
        },
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
    case "syncWallet": {
      return {
        ...state,
        points: action.pointsEarned,
        spentPoints: action.pointsSpent,
        redemptions: action.redemptions ?? state.redemptions ?? [],
      };
    }
    case "redeemShopItem": {
      // Mirror of a server redemption only — never invent codes client-side.
      return {
        ...state,
        points: Math.max(state.points, action.cost),
        spentPoints: (state.spentPoints ?? 0) + action.cost,
        redemptions: [
          ...(state.redemptions ?? []),
          {
            itemId: action.itemId,
            cost: action.cost,
            code: action.code,
            redeemedAt: action.nowIso,
          },
        ],
      };
    }
    case "adoptSnapshot": {
      const dayIndex = getDayIndex(action.snapshot.firstVisitDate, action.todayKey);
      const capped = Math.min(dayIndex, 3) as 1 | 2 | 3;
      const settings = {
        haptics: action.snapshot.settings?.haptics ?? true,
        calmMotion: action.snapshot.settings?.calmMotion ?? false,
        darkMode: action.snapshot.settings?.darkMode ?? false,
        hinglish: action.snapshot.settings?.hinglish ?? false,
      };
      return {
        ...action.snapshot,
        spentPoints: action.snapshot.spentPoints ?? 0,
        redemptions: action.snapshot.redemptions ?? [],
        revisitClaimed: action.snapshot.revisitClaimed ?? {},
        settings,
        maxUnlockedDay: getNextMaxUnlockedDay(action.snapshot.maxUnlockedDay, capped),
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
  score: number,
): TestOutcome {
  const attemptNumber = after.attempts[discoveryId] ?? 0;
  const wasCollected = Boolean(before.collected[discoveryId]);
  const isNowCollected = Boolean(after.collected[discoveryId]);
  const isRevisit =
    isPassingScore(score) &&
    wasCollected &&
    after.revisitClaimed[discoveryId] !== before.revisitClaimed[discoveryId];

  const isFirstCollect = isNowCollected && !wasCollected;
  let breakdown = emptyBreakdown();
  if (!isPassingScore(score)) {
    breakdown = breakdownForEffort(score);
  } else if (isFirstCollect) {
    breakdown = breakdownForCollect(after.streak.count);
  } else if (isRevisit) {
    breakdown = breakdownForRevisit();
  }

  return {
    isPerfect: isPerfectScore(score),
    isPassing: isPassingScore(score),
    pointsEarned: after.points - before.points,
    breakdown,
    newBadges: after.badges.filter((b) => !before.badges.some((x) => x.id === b.id)),
    streakBefore: before.streak.count,
    streakAfter: after.streak.count,
    isFirstCollect,
    attemptNumber,
    isRevisit,
    score,
  };
}
