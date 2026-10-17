import { describe, expect, it } from "vitest";
import { discoveries } from "@/content";
import { copy } from "@/content/copy";

const HAS_DASH = /[\u2013\u2014]/;

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function sentenceCount(text: string): number {
  return text
    .split(/[.?!]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

describe("content lint", () => {
  it("fridge has 6 steps, leaf and heart have 4", () => {
    expect(discoveries.find((d) => d.id === "fridge")?.steps).toHaveLength(6);
    expect(discoveries.find((d) => d.id === "leaf")?.steps).toHaveLength(4);
    expect(discoveries.find((d) => d.id === "heart")?.steps).toHaveLength(4);
  });

  it("every quiz has exactly 5 questions with 3 or 4 options and a valid answer", () => {
    for (const d of discoveries) {
      expect(d.quiz).toHaveLength(5);
      for (const q of d.quiz) {
        expect(q.options.length).toBeGreaterThanOrEqual(3);
        expect(q.options.length).toBeLessThanOrEqual(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
    }
  });

  it("step titles are 2 to 5 words; bodies are 1 to 3 sentences and 30 words or fewer", () => {
    for (const d of discoveries) {
      for (const step of d.steps) {
        const titleWords = wordCount(step.title);
        expect(titleWords).toBeGreaterThanOrEqual(2);
        expect(titleWords).toBeLessThanOrEqual(5);
        expect(sentenceCount(step.body)).toBeGreaterThanOrEqual(1);
        expect(sentenceCount(step.body)).toBeLessThanOrEqual(3);
        expect(wordCount(step.body)).toBeLessThanOrEqual(30);
      }
    }
  });

  it("labels are 2 to 4 words unless isPartName", () => {
    for (const d of discoveries) {
      for (const step of d.steps) {
        for (const label of step.labels) {
          const n = wordCount(label.text);
          if (label.isPartName) {
            expect(n).toBe(1);
          } else {
            expect(n).toBeGreaterThanOrEqual(2);
            expect(n).toBeLessThanOrEqual(4);
          }
        }
      }
    }
  });

  it("partFocus and label partIds exist in parts", () => {
    for (const d of discoveries) {
      const parts = new Set(d.parts);
      for (const step of d.steps) {
        for (const id of step.partFocus) {
          expect(parts.has(id)).toBe(true);
        }
        for (const label of step.labels) {
          expect(parts.has(label.partId)).toBe(true);
        }
      }
    }
  });

  it("no em or en dashes in content or copy", () => {
    const blobs: string[] = [JSON.stringify(discoveries), JSON.stringify(copy)];
    for (const blob of blobs) {
      expect(HAS_DASH.test(blob)).toBe(false);
    }
  });
});
