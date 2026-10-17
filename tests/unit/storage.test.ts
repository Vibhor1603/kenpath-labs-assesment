import { describe, expect, it } from "vitest";
import { createBlankProgress, createShowcaseProgress } from "@/lib/progress";
import { createStorageAdapter, isProgressShape, parseProgress } from "@/lib/storage";

describe("storage", () => {
  it("corrupt JSON falls back to showcase seed", () => {
    const { progress, status } = parseProgress("{not json", "2026-10-17");
    expect(status).toBe("recovered");
    expect(progress.collected.fridge).toBeTruthy();
  });

  it("wrong shape falls back", () => {
    const { status } = parseProgress(JSON.stringify({ version: 2 }), "2026-10-17");
    expect(status).toBe("recovered");
  });

  it("valid progress loads", () => {
    const blank = createBlankProgress("2026-10-17");
    const { progress, status } = parseProgress(JSON.stringify(blank), "2026-10-17");
    expect(status).toBe("loaded");
    expect(progress.points).toBe(0);
    expect(isProgressShape(progress)).toBe(true);
  });

  it("showcase shape validates", () => {
    expect(isProgressShape(createShowcaseProgress("2026-10-17"))).toBe(true);
  });

  it("storage that throws falls back to memory without crashing", () => {
    const original = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
      },
    });
    const adapter = createStorageAdapter();
    expect(adapter.isPersistent).toBe(false);
    adapter.setItem("k", "v");
    expect(adapter.getItem("k")).toBe("v");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: original,
    });
  });
});
