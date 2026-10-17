import { describe, expect, it } from "vitest";
import { discoveries } from "@/content";
import { copy } from "@/content/copy";

const HAS_DASH = /[\u2013\u2014]/;
const FORBIDDEN = /\b(money|cash|earnings)\b/i;

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
  it("each discovery has 6 to 15 lesson steps", () => {
    for (const d of discoveries) {
      expect(d.steps.length).toBeGreaterThanOrEqual(6);
      expect(d.steps.length).toBeLessThanOrEqual(15);
    }
  });

  it("hinglish is available for every step", () => {
    for (const d of discoveries) {
      for (const step of d.steps) {
        expect(step.hinglish?.title.length).toBeGreaterThan(0);
        expect(step.hinglish?.body.length).toBeGreaterThan(0);
      }
    }
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

  it("step titles are 2 to 5 words; bodies are 2 to 4 sentences and 55 words or fewer", () => {
    for (const d of discoveries) {
      for (const step of d.steps) {
        const titleWords = wordCount(step.title);
        expect(titleWords).toBeGreaterThanOrEqual(2);
        expect(titleWords).toBeLessThanOrEqual(5);
        expect(sentenceCount(step.body)).toBeGreaterThanOrEqual(2);
        expect(sentenceCount(step.body)).toBeLessThanOrEqual(4);
        expect(wordCount(step.body)).toBeLessThanOrEqual(55);
      }
    }
  });

  it("beats are 2 to 3 short plain lines when present", () => {
    for (const d of discoveries) {
      for (const step of d.steps) {
        if (!step.beats) continue;
        expect(step.beats.length).toBeGreaterThanOrEqual(2);
        expect(step.beats.length).toBeLessThanOrEqual(3);
        for (const beat of step.beats) {
          expect(wordCount(beat)).toBeGreaterThanOrEqual(4);
          expect(wordCount(beat)).toBeLessThanOrEqual(28);
        }
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

  it("no em or en dashes, and no money cash earnings wording", () => {
    const blobs: string[] = [JSON.stringify(discoveries), JSON.stringify(copy)];
    for (const blob of blobs) {
      expect(HAS_DASH.test(blob)).toBe(false);
      expect(FORBIDDEN.test(blob)).toBe(false);
    }
  });
});
