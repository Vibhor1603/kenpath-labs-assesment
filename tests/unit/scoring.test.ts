import { describe, expect, it } from "vitest";
import {
  BASE_POINTS,
  calculateEffortPoints,
  calculatePointsForPass,
  calculateRevisitBonus,
  calculateStreakBonus,
  isPassingScore,
  isPerfectScore,
  PASS_SCORE,
  REVISIT_BONUS,
} from "@/lib/scoring";

describe("scoring", () => {
  it("5/5 is perfect; 4/5 passes; 3/5 does not", () => {
    expect(isPerfectScore(5)).toBe(true);
    expect(isPassingScore(5)).toBe(true);
    expect(isPassingScore(PASS_SCORE)).toBe(true);
    expect(isPassingScore(3)).toBe(false);
  });

  it("first pass on day 1 gives base + streak", () => {
    expect(calculatePointsForPass({ isFirstCollect: true, newStreakCount: 1 })).toBe(
      BASE_POINTS + 50,
    );
  });

  it("streak bonus caps", () => {
    expect(calculateStreakBonus(5)).toBe(200);
  });

  it("effort points on failed attempts", () => {
    expect(calculateEffortPoints(3)).toBe(45);
  });

  it("revisit bonus once per day", () => {
    expect(
      calculateRevisitBonus({
        alreadyCollected: true,
        isPassing: true,
        lastClaimDate: null,
        todayKey: "2026-10-17",
      }),
    ).toBe(REVISIT_BONUS);
  });
});
