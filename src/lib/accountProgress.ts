import type { DiscoveryId, Progress } from "@/content/types";
import { STORAGE_KEY } from "@/lib/tokens";

const IDS: DiscoveryId[] = ["fridge", "leaf", "heart"];

export function accountStorageKey(username: string): string {
  return `${STORAGE_KEY}:acct:${username.trim().toLowerCase()}`;
}

/** Heuristic: more collected exhibits first, then more Ken points. */
export function progressRichness(p: Progress): number {
  const collected = IDS.filter((id) => p.collected[id]).length;
  return collected * 10_000 + (p.points ?? 0);
}

/**
 * Merge guest play into an account (or two accounts) without losing work.
 * Keeps the best score per exhibit and the higher lifetime points total.
 */
export function mergeProgress(guest: Progress, account: Progress): Progress {
  const richer = progressRichness(guest) >= progressRichness(account) ? guest : account;
  const other = richer === guest ? account : guest;

  const collected: Progress["collected"] = { ...other.collected };
  for (const id of IDS) {
    const a = guest.collected[id];
    const b = account.collected[id];
    if (a && b) {
      collected[id] = (a.score ?? 0) >= (b.score ?? 0) ? a : b;
    } else {
      collected[id] = a ?? b;
    }
  }

  const points = Math.max(guest.points ?? 0, account.points ?? 0);
  const spentGuest = guest.spentPoints ?? 0;
  const spentAccount = account.spentPoints ?? 0;
  const spentPoints = Math.min(points, Math.max(spentGuest, spentAccount));

  const badgeMap = new Map<string, (typeof guest.badges)[number]>();
  for (const b of [...account.badges, ...guest.badges]) {
    if (!badgeMap.has(b.id)) badgeMap.set(b.id, b);
  }

  const redemptions = [...(account.redemptions ?? []), ...(guest.redemptions ?? [])];
  const seenCodes = new Set<string>();
  const uniqueRedemptions = redemptions.filter((r) => {
    if (seenCodes.has(r.code)) return false;
    seenCodes.add(r.code);
    return true;
  });

  const attempts: Progress["attempts"] = { ...account.attempts };
  for (const id of IDS) {
    attempts[id] = Math.max(guest.attempts[id] ?? 0, account.attempts[id] ?? 0);
  }

  return {
    ...richer,
    points,
    spentPoints,
    redemptions: uniqueRedemptions,
    collected,
    attempts,
    maxUnlockedDay: Math.max(guest.maxUnlockedDay, account.maxUnlockedDay) as 1 | 2 | 3,
    badges: [...badgeMap.values()],
    seenBadges: [...new Set([...guest.seenBadges, ...account.seenBadges])],
    revisitClaimed: { ...account.revisitClaimed, ...guest.revisitClaimed },
    streak:
      (guest.streak.count ?? 0) >= (account.streak.count ?? 0)
        ? guest.streak
        : account.streak,
    settings: {
      ...account.settings,
      ...guest.settings,
    },
    introDismissed: guest.introDismissed || account.introDismissed,
  };
}
