import type { Badge, BadgeId, DiscoveryId, Progress } from "@/content/types";

const ALL_DISCOVERIES: DiscoveryId[] = ["fridge", "leaf", "heart"];

export function getNewBadges(
  after: Progress,
  ctx: {
    isPerfect: boolean;
    isPassing: boolean;
    attemptNumber: number;
    score: number;
    isRevisitBonus: boolean;
  },
  earnedAtIso: string,
): Badge[] {
  const earned = new Set(after.badges.map((b) => b.id));
  const next: Badge[] = [];

  const add = (id: BadgeId) => {
    if (!earned.has(id)) {
      next.push({ id, earnedAt: earnedAtIso });
      earned.add(id);
    }
  };

  // Near miss: 3 of 5 (one below the pass line).
  if (ctx.score === 3) add("close-call");
  if (ctx.isRevisitBonus) add("return-visitor");

  if (!ctx.isPassing) return next;

  add("first-discovery");
  if (ctx.isPerfect && ctx.attemptNumber === 1) add("perfect-scholar");
  if (after.streak.count >= 3) add("streak-3");
  if (ALL_DISCOVERIES.every((id) => after.collected[id])) add("curious-mind");

  return next;
}

export function getUnseenBadges(progress: Progress): BadgeId[] {
  const seen = new Set(progress.seenBadges);
  return progress.badges.map((b) => b.id).filter((id) => !seen.has(id));
}
