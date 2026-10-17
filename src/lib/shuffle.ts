import type { Discovery, ShuffledQuestion } from "@/content/types";

/** FNV-1a 32-bit. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Mulberry32. */
export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  const random = createSeededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildQuizAttempt(
  discovery: Discovery,
  attemptNumber: number,
): ShuffledQuestion[] {
  const seed = hashString(`${discovery.id}${attemptNumber}`);
  const order = shuffleWithSeed(
    discovery.quiz.map((_, i) => i),
    seed,
  );

  return order.map((qi, questionIndex) => {
    const original = discovery.quiz[qi];
    const optionIndexes = shuffleWithSeed(
      original.options.map((_, i) => i),
      seed + questionIndex + 1,
    );
    const options = optionIndexes.map((i) => original.options[i]);
    const answer = optionIndexes.indexOf(original.answer);
    return {
      id: original.id,
      q: original.q,
      options,
      answer,
      why: original.why,
      originalOptionIndexes: optionIndexes,
    };
  });
}

export function toOriginalOptionIndex(
  question: ShuffledQuestion,
  pickedIndex: number,
): number {
  return question.originalOptionIndexes[pickedIndex];
}
