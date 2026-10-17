import { describe, expect, it } from "vitest";
import {
  createFreshProgress,
  getTestOutcome,
  progressReducer,
} from "@/lib/progress";

describe("progress", () => {
  it("full 3-day scenario gives 120 then 260 with streak 2", () => {
    let p = createFreshProgress("2026-10-17");
    p = progressReducer(p, { type: "boot", todayKey: "2026-10-17" });

    const before1 = p;
    p = progressReducer(p, {
      type: "finishTest",
      discoveryId: "fridge",
      score: 5,
      todayKey: "2026-10-17",
      nowIso: "2026-10-17T10:00:00Z",
    });
    expect(p.points).toBe(120);
    expect(p.streak.count).toBe(1);
    const out1 = getTestOutcome(before1, p, "fridge");
    expect(out1.isPerfect).toBe(true);
    expect(out1.pointsEarned).toBe(120);
    expect(out1.isFirstCollect).toBe(true);

    p = progressReducer(p, { type: "boot", todayKey: "2026-10-18" });
    expect(p.maxUnlockedDay).toBe(2);

    const before2 = p;
    p = progressReducer(p, {
      type: "finishTest",
      discoveryId: "leaf",
      score: 5,
      todayKey: "2026-10-18",
      nowIso: "2026-10-18T10:00:00Z",
    });
    expect(p.points).toBe(260);
    expect(p.streak.count).toBe(2);
    expect(getTestOutcome(before2, p, "leaf").pointsEarned).toBe(140);
  });

  it("imperfect score only increments attempts", () => {
    let p = createFreshProgress("2026-10-17");
    p = progressReducer(p, {
      type: "finishTest",
      discoveryId: "fridge",
      score: 4,
      todayKey: "2026-10-17",
      nowIso: "iso",
    });
    expect(p.points).toBe(0);
    expect(p.attempts.fridge).toBe(1);
    expect(p.collected.fridge).toBeUndefined();
  });

  it("introDismissed persists", () => {
    let p = createFreshProgress("2026-10-17");
    p = progressReducer(p, { type: "dismissIntro" });
    expect(p.introDismissed).toBe(true);
  });
});
