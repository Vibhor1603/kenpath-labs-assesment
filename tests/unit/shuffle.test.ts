import { describe, expect, it } from "vitest";
import { fridge } from "@/content";
import { buildQuizAttempt, hashString, shuffleWithSeed } from "@/lib/shuffle";

describe("shuffle", () => {
  it("same seed gives same order", () => {
    const a = shuffleWithSeed([1, 2, 3, 4, 5], 42);
    const b = shuffleWithSeed([1, 2, 3, 4, 5], 42);
    expect(a).toEqual(b);
  });

  it("different attempt gives different order for shipped content", () => {
    const a = buildQuizAttempt(fridge, 1);
    const b = buildQuizAttempt(fridge, 2);
    const sameOrder = a.every((q, i) => q.id === b[i].id);
    const sameOptions = a.every(
      (q, i) => q.options.join("|") === b[i].options.join("|"),
    );
    expect(sameOrder && sameOptions).toBe(false);
  });

  it("after shuffling, options[answer] is still the correct text", () => {
    for (let attempt = 1; attempt <= 5; attempt++) {
      const questions = buildQuizAttempt(fridge, attempt);
      for (const q of questions) {
        const original = fridge.quiz.find((x) => x.id === q.id)!;
        expect(q.options[q.answer]).toBe(original.options[original.answer]);
      }
    }
  });

  it("hashString is stable", () => {
    expect(hashString("fridge1")).toBe(hashString("fridge1"));
  });
});
