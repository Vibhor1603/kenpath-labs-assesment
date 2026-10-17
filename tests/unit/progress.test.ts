import { describe, expect, it } from "vitest";
import { addDays, toDateKey } from "@/lib/date";
import {
  createBlankProgress,
  createShowcaseProgress,
  getTestOutcome,
  progressReducer,
} from "@/lib/progress";

describe("progress", () => {
  it("showcase seeds fridge and leaf so heart is today", () => {
    const today = toDateKey(new Date());
    const p = createShowcaseProgress(today);
    expect(p.firstVisitDate).toBe(addDays(today, -2));
    expect(p.maxUnlockedDay).toBe(3);
    expect(p.collected.fridge?.score).toBe(5);
    expect(p.collected.leaf?.score).toBe(4);
    expect(p.collected.heart).toBeUndefined();
    expect(p.streak.count).toBe(2);
  });

  it("4 of 5 collects; 3 of 5 only gives effort", () => {
    let p = createBlankProgress("2026-10-17");

    p = progressReducer(p, {
      type: "finishTest",
      discoveryId: "fridge",
      score: 3,
      todayKey: "2026-10-17",
      nowIso: "iso",
    });
    expect(p.points).toBe(45);
    expect(p.collected.fridge).toBeUndefined();

    const before = p;
    p = progressReducer(p, {
      type: "finishTest",
      discoveryId: "fridge",
      score: 4,
      todayKey: "2026-10-17",
      nowIso: "iso-2",
    });
    expect(p.collected.fridge?.score).toBe(4);
    expect(getTestOutcome(before, p, "fridge", 4).isPassing).toBe(true);
    expect(getTestOutcome(before, p, "fridge", 4).isPerfect).toBe(false);
  });
});
