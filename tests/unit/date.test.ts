import { describe, expect, it } from "vitest";
import { addDays, daysBetween, toDateKey } from "@/lib/date";

describe("date", () => {
  it("toDateKey uses local date parts", () => {
    const d = new Date(2026, 9, 17, 23, 30);
    expect(toDateKey(d)).toBe("2026-10-17");
  });

  it("daysBetween across month end", () => {
    expect(daysBetween("2026-01-31", "2026-02-01")).toBe(1);
  });

  it("daysBetween across year end", () => {
    expect(daysBetween("2025-12-31", "2026-01-01")).toBe(1);
  });

  it("daysBetween leap day 2028-02-28 to 2028-03-01 is 2", () => {
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
  });

  it("same day is 0", () => {
    expect(daysBetween("2026-10-17", "2026-10-17")).toBe(0);
  });

  it("addDays works across months", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });
});
