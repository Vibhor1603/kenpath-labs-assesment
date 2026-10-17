import { describe, expect, it } from "vitest";
import { mergeProgress, progressRichness } from "@/lib/accountProgress";
import { createBlankProgress, createShowcaseProgress } from "@/lib/progress";

describe("account progress merge", () => {
  it("keeps guest work when creating an account", () => {
    const guest = createBlankProgress("2026-10-17");
    guest.points = 215;
    guest.collected.fridge = {
      perfectAt: "2026-10-17",
      firstTry: true,
      score: 4,
    };
    const account = createBlankProgress("2026-10-01");
    const merged = mergeProgress(guest, account);
    expect(merged.points).toBe(215);
    expect(merged.collected.fridge?.score).toBe(4);
  });

  it("prefers the richer museum and the higher score per exhibit", () => {
    const guest = createBlankProgress("2026-10-17");
    guest.collected.fridge = { perfectAt: "2026-10-17", firstTry: true, score: 4 };
    guest.points = 200;
    const account = createShowcaseProgress("2026-10-17");
    expect(progressRichness(account)).toBeGreaterThan(progressRichness(guest));
    const merged = mergeProgress(guest, account);
    expect(merged.collected.fridge?.score).toBe(5);
    expect(merged.collected.leaf?.score).toBe(4);
    expect(merged.points).toBe(550);
  });
});
