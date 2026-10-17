"use client";

import { QuizCard } from "@/components/app/QuizCard";
import { copy } from "@/content/copy";
import { getDiscovery } from "@/content/index";
import type { DiscoveryId, ShuffledQuestion } from "@/content/types";
import { buildQuizAttempt } from "@/lib/shuffle";
import { m } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";

type CardState = "idle" | "selected" | "correct" | "wrong" | "revealed";

export type TestViewProps = {
  discoveryId: DiscoveryId;
  attemptNumber: number;
  onComplete: (score: number) => void;
  /** Passed so the parent BottomBar can render a "Next" button. */
  onNextReady?: (handler: () => void, isReady: boolean) => void;
};

/**
 * TestView: 5-question multiple choice quiz.
 * Progress bar scales from left. Tapping an option gives feedback < 100ms.
 * After Q5, calls onComplete with final score.
 */
export function TestView({
  discoveryId,
  attemptNumber,
  onComplete,
  onNextReady,
}: TestViewProps) {
  const discovery = getDiscovery(discoveryId);
  const questions = useMemo(
    () => (discovery ? buildQuizAttempt(discovery, attemptNumber) : []),
    [discovery, attemptNumber],
  );

  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);

  const question: ShuffledQuestion | undefined = questions[qIndex];

  const handleQuestionComplete = useCallback(
    (earnedPoint: boolean) => {
      const nextScore = score + (earnedPoint ? 1 : 0);
      if (earnedPoint) setScore(nextScore);

      const nextIdx = qIndex + 1;
      if (nextIdx >= questions.length) {
        onComplete(nextScore);
      } else {
        setQIndex(nextIdx);
      }
    },
    [score, qIndex, questions.length, onComplete],
  );

  if (!question) return null;

  return (
    <CurrentQuestion
      key={question.id}
      question={question}
      qIndex={qIndex}
      totalQuestions={questions.length}
      onAnswered={handleQuestionComplete}
      onNextReady={onNextReady}
    />
  );
}

type CurrentQuestionProps = {
  question: ShuffledQuestion;
  qIndex: number;
  totalQuestions: number;
  onAnswered: (earnedPoint: boolean) => void;
  onNextReady?: (handler: () => void, isReady: boolean) => void;
};

function CurrentQuestion({
  question,
  qIndex,
  totalQuestions,
  onAnswered,
  onNextReady,
}: CurrentQuestionProps) {
  const [cardStates, setCardStates] = useState<CardState[]>(() =>
    question.options.map(() => "idle" as CardState),
  );

  const isAnswered = cardStates.some((s) => s !== "idle");
  const progress = (qIndex + (isAnswered ? 1 : 0)) / totalQuestions;

  const earnedPoint = cardStates.some(
    (s, i) => s === "correct" && i === question.answer,
  );

  const handleNext = useCallback(() => {
    onAnswered(earnedPoint);
  }, [onAnswered, earnedPoint]);

  useEffect(() => {
    onNextReady?.(handleNext, isAnswered);
  }, [isAnswered, handleNext, onNextReady]);

  const handleSelect = (optionIndex: number) => {
    if (isAnswered) return;
    const isCorrect = optionIndex === question.answer;

    setCardStates((prev) => {
      const next = [...prev];
      next[optionIndex] = isCorrect ? "correct" : "wrong";
      if (!isCorrect) next[question.answer] = "revealed";
      return next;
    });
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="mx-4 mt-3 h-1 overflow-hidden rounded-full bg-card">
        <m.div
          className="h-full rounded-full bg-foreground"
          animate={{ scaleX: progress }}
          initial={{ scaleX: 0 }}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      {/* Question counter */}
      <p className="mx-4 mt-2 text-[13px] font-medium text-muted-foreground">
        {copy.test.questionOf(qIndex + 1, totalQuestions)}
      </p>

      {/* Question */}
      <div className="mx-4 mt-4 mb-6">
        <h2 className="font-display text-[22px] font-[600] leading-snug text-foreground">
          {question.q}
        </h2>
      </div>

      {/* Answer cards */}
      <div className="flex flex-col gap-3 px-4 pb-4 overflow-y-auto">
        {question.options.map((opt, i) => (
          <QuizCard
            key={`${question.id}-${i}`}
            text={opt}
            state={cardStates[i] ?? "idle"}
            onSelect={() => handleSelect(i)}
            index={i}
          />
        ))}

        {/* Why explanation */}
        {isAnswered && (
          <m.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 }}
            className="mt-1 rounded-[12px] bg-card px-4 py-3 text-[15px] text-muted-foreground"
          >
            {question.why}
          </m.p>
        )}
      </div>
    </div>
  );
}
