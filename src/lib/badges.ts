import type { Badge, BadgeId, DiscoveryId, Progress } from "@/content/types";

const ALL_DISCOVERIES: DiscoveryId[] = ["fridge", "leaf", "heart"];

export function getNewBadges(
  after: Progress,
  ctx: { isPerfect: boolean; attemptNumber: number },
  earnedAtIso: string,
): Badge[] {
  if (!ctx.isPerfect) return [];

  const earned = new Set(after.badges.map((b) => b.id));
  const next: Badge[] = [];

  const add = (id: BadgeId) => {
    if (!earned.has(id)) {
      next.push({ id, earnedAt: earnedAtIso });
      earned.add(id);
    }
  };

  add("first-discovery");
  if (ctx.attemptNumber === 1) add("perfect-scholar");
  if (after.streak.count >= 3) add("streak-3");
  if (ALL_DISCOVERIES.every((id) => after.collected[id])) add("curious-mind");

  return next;
}

export function getUnseenBadges(progress: Progress): BadgeId[] {
  const seen = new Set(progress.seenBadges);
  return progress.badges.map((b) => b.id).filter((id) => !seen.has(id));
}
