import { describe, expect, it } from "vitest";
import {
  getDisplayedStreak,
  getStreakAfterPass,
  isStreakBroken,
} from "@/lib/streak";

describe("streak", () => {
  it("first perfect gives 1", () => {
    const next = getStreakAfterPass(
      { count: 0, lastPerfectDate: null },
      "2026-10-17",
    );
    expect(next).toEqual({ count: 1, lastPerfectDate: "2026-10-17" });
  });

  it("second perfect same day stays 1", () => {
    const next = getStreakAfterPass(
      { count: 1, lastPerfectDate: "2026-10-17" },
      "2026-10-17",
    );
    expect(next.count).toBe(1);
  });

  it("perfect next day gives 2", () => {
    const next = getStreakAfterPass(
      { count: 1, lastPerfectDate: "2026-10-17" },
      "2026-10-18",
    );
    expect(next).toEqual({ count: 2, lastPerfectDate: "2026-10-18" });
  });

  it("perfect after 1-day gap resets to 1", () => {
    const next = getStreakAfterPass(
      { count: 2, lastPerfectDate: "2026-10-17" },
      "2026-10-19",
    );
    expect(next).toEqual({ count: 1, lastPerfectDate: "2026-10-19" });
  });

  it("displayed streak is 0 when lastPerfectDate is 2+ days ago", () => {
    expect(
      getDisplayedStreak(
        { count: 3, lastPerfectDate: "2026-10-15" },
        "2026-10-17",
      ),
    ).toBe(0);
    expect(
      isStreakBroken({ count: 3, lastPerfectDate: "2026-10-15" }, "2026-10-17"),
    ).toBe(true);
  });

  it("replay perfect counts for streak", () => {
    const next = getStreakAfterPass(
      { count: 1, lastPerfectDate: "2026-10-17" },
      "2026-10-18",
    );
    expect(next.count).toBe(2);
  });
});
