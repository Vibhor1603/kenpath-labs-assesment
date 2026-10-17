import { describe, expect, it } from "vitest";
import type { Progress } from "@/content/types";
import { getNewBadges, getUnseenBadges } from "@/lib/badges";
import { createFreshProgress } from "@/lib/progress";

function base(): Progress {
  return createFreshProgress("2026-10-17");
}

describe("badges", () => {
  it("First Discovery on first perfect", () => {
    const after = {
      ...base(),
      collected: { fridge: { perfectAt: "2026-10-17", firstTry: true } },
      streak: { count: 1, lastPerfectDate: "2026-10-17" },
    };
    const badges = getNewBadges(after, { isPerfect: true, attemptNumber: 1 }, "iso");
    expect(badges.map((b) => b.id)).toContain("first-discovery");
    expect(badges.map((b) => b.id)).toContain("perfect-scholar");
  });

  it("Perfect Scholar only when attempt 1 is perfect", () => {
    const after = {
      ...base(),
      collected: { fridge: { perfectAt: "2026-10-17", firstTry: false } },
      streak: { count: 1, lastPerfectDate: "2026-10-17" },
    };
    const badges = getNewBadges(after, { isPerfect: true, attemptNumber: 2 }, "iso");
    expect(badges.map((b) => b.id)).not.toContain("perfect-scholar");
  });

  it("3-Day Streak at count 3", () => {
    const after = {
      ...base(),
      collected: { fridge: { perfectAt: "2026-10-17", firstTry: true } },
      streak: { count: 3, lastPerfectDate: "2026-10-19" },
      badges: [{ id: "first-discovery" as const, earnedAt: "a" }],
    };
    const badges = getNewBadges(after, { isPerfect: true, attemptNumber: 2 }, "iso");
    expect(badges.map((b) => b.id)).toContain("streak-3");
  });

  it("Curious Mind when all 3 collected", () => {
    const after = {
      ...base(),
      collected: {
        fridge: { perfectAt: "2026-10-17", firstTry: true },
        leaf: { perfectAt: "2026-10-18", firstTry: true },
        heart: { perfectAt: "2026-10-19", firstTry: true },
      },
      streak: { count: 3, lastPerfectDate: "2026-10-19" },
      badges: [
        { id: "first-discovery" as const, earnedAt: "a" },
        { id: "perfect-scholar" as const, earnedAt: "a" },
        { id: "streak-3" as const, earnedAt: "a" },
      ],
    };
    const badges = getNewBadges(after, { isPerfect: true, attemptNumber: 1 }, "iso");
    expect(badges.map((b) => b.id)).toContain("curious-mind");
  });

  it("no duplicates and seenBadges controls popup", () => {
    const after = {
      ...base(),
      badges: [{ id: "first-discovery" as const, earnedAt: "a" }],
      seenBadges: [],
      collected: { fridge: { perfectAt: "2026-10-17", firstTry: true } },
      streak: { count: 1, lastPerfectDate: "2026-10-17" },
    };
    const again = getNewBadges(after, { isPerfect: true, attemptNumber: 2 }, "iso");
    expect(again.map((b) => b.id)).not.toContain("first-discovery");
    expect(getUnseenBadges(after)).toEqual(["first-discovery"]);
    expect(
      getUnseenBadges({ ...after, seenBadges: ["first-discovery"] }),
    ).toEqual([]);
  });
});
