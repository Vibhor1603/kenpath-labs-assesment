import { describe, expect, it } from "vitest";
import { getContrastRatio } from "@/lib/contrast";
import { contrastPairs } from "@/lib/tokens";

describe("contrast", () => {
  it("token pairs meet stated floors", () => {
    for (const pair of contrastPairs) {
      const ratio = getContrastRatio(pair.fg, pair.bg);
      if ("mustFailAsText" in pair && pair.mustFailAsText) {
        expect(ratio).toBeLessThan(3);
        expect(Math.abs(ratio - pair.stated)).toBeLessThan(0.06);
        continue;
      }
      expect(ratio).toBeGreaterThanOrEqual(pair.floor);
      expect(Math.abs(ratio - pair.stated)).toBeLessThan(0.15);
    }
  });
});
