"use client";

import { BottomBar } from "@/components/app/BottomBar";
import { FlowTopBar } from "@/components/app/TopBar";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import type { Discovery } from "@/content/types";
import { vibrateCorrect } from "@/lib/haptics";
import { buildQuizAttempt } from "@/lib/shuffle";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";

type TestViewProps = {
  discovery: Discovery;
  attemptNumber: number;
  haptics: boolean;
  /** Called the moment question 5 is answered: that is when an attempt counts. */
  onFinish: (score: number, results: boolean[]) => void;
  onSeeResult: () => void;
  onClose: () => void;
};

const LETTERS = ["A", "B", "C", "D"];

export default function TestView({
  discovery,
  attemptNumber,
  haptics,
  onFinish,
  onSeeResult,
  onClose,
}: TestViewProps) {
  // Fixed for the life of this attempt; the stored count changes when question 5 is answered.
  const [attempt] = useState(attemptNumber);
  const questions = useMemo(
    () => buildQuizAttempt(discovery, attempt),
    [discovery, attempt],
  );
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const q = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const answered = picked !== null;
  const correct = answered && picked === q.answer;

  const pick = (i: number) => {
    if (answered) return;
    const ok = i === q.answer;
    const nextResults = [...results, ok];
    setPicked(i);
    setResults(nextResults);
    if (ok) vibrateCorrect(haptics);
    if (isLast) onFinish(nextResults.filter(Boolean).length, nextResults);
  };

  const next = () => {
    if (!answered) return;
    if (isLast) {
      onSeeResult();
      return;
    }
    setIndex(index + 1);
    setPicked(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-domain={discovery.domain}>
      <FlowTopBar
        current={index + 1}
        total={total}
        done={results.length}
        onClose={onClose}
        closeLabel={copy.test.close}
      />

      <main className="scroll-area min-h-0 flex-1 px-[max(16px,env(safe-area-inset-left))] pt-4 pb-4">
        <div key={q.id} className="anim-view-in">
          <p className="eyebrow text-ink-soft">
            {copy.test.questionOf(index + 1, total)}
          </p>
          <h2 className="mt-2 min-h-[56px] text-[22px] leading-[28px]">{q.q}</h2>

          <div className="mt-5 flex flex-col gap-3" role="group" aria-label={q.q}>
            {q.options.map((option, i) => {
              const isPicked = picked === i;
              const isAnswer = i === q.answer;
              const state = !answered
                ? "idle"
                : isPicked && isAnswer
                  ? "correct"
                  : isPicked
                    ? "wrong"
                    : isAnswer
                      ? "reveal"
                      : "muted";
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => pick(i)}
                  aria-disabled={answered || undefined}
                  aria-pressed={isPicked}
                  className={cn(
                    "pressable flex min-h-16 w-full items-center gap-3.5 rounded-[18px] px-4 py-3 text-left text-[17px] leading-[23px] ring-inset",
                    "active:scale-[0.98]",
                    state === "idle" &&
                      "bg-surface ring-line hover:ring-line-strong ring-1",
                    state === "correct" && "bg-correct-tint ring-correct ring-2",
                    state === "wrong" && "anim-shake bg-wrong-tint ring-wrong ring-2",
                    state === "reveal" && "bg-surface ring-correct ring-2",
                    state === "muted" && "bg-surface ring-line opacity-50 ring-1",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors duration-150",
                      state === "idle" || state === "muted"
                        ? "bg-sunk text-ink-soft"
                        : "",
                      state === "correct" || state === "reveal"
                        ? "bg-correct text-surface"
                        : "",
                      state === "wrong" ? "bg-wrong text-surface" : "",
                    )}
                    aria-hidden="true"
                  >
                    {state === "correct" || state === "reveal" ? (
                      <Check className="anim-pop-in size-4" strokeWidth={3} />
                    ) : state === "wrong" ? (
                      <X className="anim-pop-in size-4" strokeWidth={3} />
                    ) : (
                      LETTERS[i]
                    )}
                  </span>
                  <span className="min-w-0 flex-1 font-semibold">{option}</span>
                  {state === "reveal" ? (
                    <span className="sr-only">Right answer</span>
                  ) : null}
                  {state === "wrong" ? (
                    <span className="sr-only">Your answer, not right</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-4 min-h-[88px]" aria-live="polite">
            {answered ? (
              <div
                className={cn(
                  "anim-rise-in flex gap-3 rounded-[18px] p-4",
                  correct ? "bg-correct-tint" : "bg-wrong-tint",
                )}
              >
                <span
                  className={cn(
                    "text-surface mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                    correct ? "bg-correct" : "bg-wrong",
                  )}
                  aria-hidden="true"
                >
                  {correct ? (
                    <Check className="size-3.5" strokeWidth={3} />
                  ) : (
                    <X className="size-3.5" strokeWidth={3} />
                  )}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[17px] leading-[23px] font-semibold",
                      correct ? "text-correct" : "text-wrong",
                    )}
                  >
                    {correct
                      ? copy.quiz.correct[index % copy.quiz.correct.length]
                      : copy.quiz.wrong}
                  </p>
                  <p className="text-small text-ink mt-0.5">{q.why}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      <BottomBar>
        <Button className="flex-1" onClick={next} disabled={!answered}>
          {isLast ? copy.test.seeResult : copy.test.next}
        </Button>
      </BottomBar>
    </div>
  );
}
