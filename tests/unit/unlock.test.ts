import { describe, expect, it } from "vitest";
import { discoveries } from "@/content";
import type { Progress } from "@/content/types";
import { createBlankProgress } from "@/lib/progress";
import {
  getDayIndex,
  getNextMaxUnlockedDay,
  getTodaysDiscoveryForDate,
  isDiscoveryUnlocked,
} from "@/lib/unlock";

function withCollected(p: Progress, ids: ("fridge" | "leaf" | "heart")[]): Progress {
  const collected = { ...p.collected };
  for (const id of ids) {
    collected[id] = { perfectAt: p.firstVisitDate, firstTry: true, score: 5 };
  }
  return { ...p, collected };
}

describe("unlock", () => {
  it("first visit unlocks day 1 only", () => {
    expect(getDayIndex("2026-10-17", "2026-10-17")).toBe(1);
    expect(getNextMaxUnlockedDay(1, 1)).toBe(1);
    expect(isDiscoveryUnlocked(1, 1, false)).toBe(true);
    expect(isDiscoveryUnlocked(2, 1, false)).toBe(false);
  });

  it("next calendar day unlocks day 2", () => {
    expect(getDayIndex("2026-10-17", "2026-10-18")).toBe(2);
    expect(getNextMaxUnlockedDay(1, 2)).toBe(2);
  });

  it("day 3 and later unlock all 3", () => {
    expect(getDayIndex("2026-10-17", "2026-10-19")).toBe(3);
    expect(getDayIndex("2026-10-17", "2026-10-25")).toBe(9);
    expect(getNextMaxUnlockedDay(2, 9)).toBe(3);
  });

  it("clock moved back keeps maxUnlockedDay", () => {
    expect(getNextMaxUnlockedDay(3, 1)).toBe(3);
  });

  it("demo unlocks all without changing stored progress", () => {
    expect(isDiscoveryUnlocked(3, 1, true)).toBe(true);
  });

  it("todays discovery follows rules including all collected", () => {
    let p = createBlankProgress("2026-10-17");
    p = { ...p, maxUnlockedDay: 3 };
    const day1 = getTodaysDiscoveryForDate(discoveries, p, "2026-10-17", false);
    expect(day1.discovery.id).toBe("fridge");
    expect(day1.state).toBe("new");

    p = withCollected(p, ["fridge", "leaf", "heart"]);
    const done = getTodaysDiscoveryForDate(discoveries, p, "2026-10-19", false);
    expect(done.state).toBe("all-done");
  });
});
