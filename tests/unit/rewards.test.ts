import { describe, expect, it } from "vitest";
import { demoRewardUnits, POINTS_PER_REWARD_UNIT } from "@/lib/rewards";

describe("demo reward units", () => {
  it("maps points to whole units", () => {
    expect(POINTS_PER_REWARD_UNIT).toBe(10);
    expect(demoRewardUnits(0)).toBe(0);
    expect(demoRewardUnits(249)).toBe(24);
    expect(demoRewardUnits(250)).toBe(25);
  });
});
