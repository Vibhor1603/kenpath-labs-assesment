import { describe, expect, it } from "vitest";
import type { Progress } from "@/content/types";
import { getNewBadges } from "@/lib/badges";
import { createBlankProgress } from "@/lib/progress";

function blank(): Progress {
  return createBlankProgress("2026-10-17");
}

describe("badges", () => {
  it("first pass earns First Discovery", () => {
    const after = {
      ...blank(),
      collected: { fridge: { perfectAt: "2026-10-17", firstTry: true, score: 4 } },
      streak: { count: 1, lastPerfectDate: "2026-10-17" },
    };
    const badges = getNewBadges(
      after,
      {
        isPerfect: false,
        isPassing: true,
        attemptNumber: 1,
        score: 4,
        isRevisitBonus: false,
      },
      "iso",
    );
    expect(badges.map((b) => b.id)).toContain("first-discovery");
    expect(badges.map((b) => b.id)).not.toContain("perfect-scholar");
  });

  it("Perfect Scholar needs 5 of 5 on attempt 1", () => {
    const after = {
      ...blank(),
      collected: { fridge: { perfectAt: "2026-10-17", firstTry: true, score: 5 } },
      streak: { count: 1, lastPerfectDate: "2026-10-17" },
    };
    const badges = getNewBadges(
      after,
      {
        isPerfect: true,
        isPassing: true,
        attemptNumber: 1,
        score: 5,
        isRevisitBonus: false,
      },
      "iso",
    );
    expect(badges.map((b) => b.id)).toContain("perfect-scholar");
  });

  it("Close Call on 3 of 5", () => {
    const badges = getNewBadges(
      blank(),
      {
        isPerfect: false,
        isPassing: false,
        attemptNumber: 1,
        score: 3,
        isRevisitBonus: false,
      },
      "iso",
    );
    expect(badges.map((b) => b.id)).toEqual(["close-call"]);
  });
});
