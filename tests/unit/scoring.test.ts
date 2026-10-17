import { describe, expect, it } from "vitest";
import {
  calculatePointsForPass,
  calculateStreakBonus,
  isPerfectScore,
} from "@/lib/scoring";

describe("scoring", () => {
  it("5/5 is perfect, 4/5 is not", () => {
    expect(isPerfectScore(5)).toBe(true);
    expect(isPerfectScore(4)).toBe(false);
  });

  it("first perfect on day 1 gives 120", () => {
    expect(
      calculatePointsForPass({ isFirstCollect: true, newStreakCount: 1 }),
    ).toBe(120);
  });

  it("first perfect with streak 3 gives 160", () => {
    expect(
      calculatePointsForPass({ isFirstCollect: true, newStreakCount: 3 }),
    ).toBe(160);
  });

  it("bonus caps at 100", () => {
    expect(calculateStreakBonus(5)).toBe(100);
    expect(
      calculatePointsForPass({ isFirstCollect: true, newStreakCount: 5 }),
    ).toBe(200);
  });

  it("replay perfect gives 0 points", () => {
    expect(
      calculatePointsForPass({ isFirstCollect: false, newStreakCount: 3 }),
    ).toBe(0);
  });
});
