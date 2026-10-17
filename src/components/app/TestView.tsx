"use client";

import { BottomBar } from "@/components/app/BottomBar";
import { FlowTopBar } from "@/components/app/TopBar";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import type { Discovery } from "@/content/types";
import { vibrateCorrect } from "@/lib/haptics";
import { buildQuizAttempt } from "@/lib/shuffle";
import type { QuizStartPayload } from "@/lib/wallet";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";

type LocalFinish = (score: number, results: boolean[]) => void;
type ServerFinish = (
  selectedIndices: number[],
) => Promise<{ score: number; results: boolean[] }>;

type TestViewProps = {
  discovery: Discovery;
  attemptNumber: number;
  haptics: boolean;
  /** When set, questions come from the server (no answer key). */
  serverPaper: QuizStartPayload | null;
  serverLoading?: boolean;
  serverError?: string | null;
  onFinishLocal: LocalFinish;
  onFinishServer: ServerFinish;
  onSeeResult: () => void;
  onClose: () => void;
  onNeedAuth?: () => void;
  requireAuth: boolean;
};

const LETTERS = ["A", "B", "C", "D"];

export default function TestView({
  discovery,
  attemptNumber,
  haptics,
  serverPaper,
  serverLoading,
  serverError,
  onFinishLocal,
  onFinishServer,
  onSeeResult,
  onClose,
  onNeedAuth,
  requireAuth,
}: TestViewProps) {
  const [attempt] = useState(attemptNumber);
  const localQuestions = useMemo(
    () => buildQuizAttempt(discovery, attempt),
    [discovery, attempt],
  );

  const serverMode = Boolean(serverPaper);
  const questions = serverMode
    ? (serverPaper?.questions ?? []).map((q) => ({
        id: q.id,
        q: q.q,
        options: q.options,
        answer: -1,
        why: "",
      }))
    : localQuestions;

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [selections, setSelections] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (requireAuth && !serverPaper && !serverLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-6">
        <p className="text-center text-[16px] font-semibold">
          {serverError ?? copy.auth.walletRequired}
        </p>
        <Button
          onClick={() => {
            onNeedAuth?.();
          }}
        >
          {copy.auth.login}
        </Button>
        <Button variant="secondary" onClick={onClose}>
          {copy.test.close}
        </Button>
      </div>
    );
  }

  if (serverLoading || questions.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center px-6">
        <p className="text-ink-soft text-[15px] font-semibold">
          {serverError ?? copy.test.loadingServer}
        </p>
      </div>
    );
  }

  const q = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const answered = picked !== null;
  const correct = !serverMode && answered && picked === q.answer;

  const pick = (i: number) => {
    if (answered || submitting) return;
    if (serverMode) {
      setPicked(i);
      setSelections((prev) => [...prev, i]);
      setResults((prev) => [...prev, true]); // placeholder until server grades
      return;
    }
    const ok = i === q.answer;
    const nextResults = [...results, ok];
    setPicked(i);
    setResults(nextResults);
    if (ok) vibrateCorrect(haptics);
    if (isLast) onFinishLocal(nextResults.filter(Boolean).length, nextResults);
  };

  const next = async () => {
    if (!answered || submitting) return;
    if (!isLast) {
      setIndex(index + 1);
      setPicked(null);
      return;
    }

    if (serverMode) {
      setSubmitting(true);
      setSubmitError(null);
      try {
        const graded = await onFinishServer(selections);
        setResults(graded.results);
        if (graded.score === total) vibrateCorrect(haptics);
        // Parent navigates after setting attempt (avoids stale React state).
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : "Submit failed");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    onSeeResult();
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
            {serverMode ? ` · ${copy.test.serverGraded}` : ""}
          </p>
          <h2 className="mt-2 min-h-[56px] text-[22px] leading-[28px]">{q.q}</h2>

          <div className="mt-5 flex flex-col gap-3" role="group" aria-label={q.q}>
            {q.options.map((option, i) => {
              const isPicked = picked === i;
              const isAnswer = !serverMode && i === q.answer;
              const state = !answered
                ? "idle"
                : serverMode
                  ? isPicked
                    ? "correct"
                    : "muted"
                  : isPicked && isAnswer
                    ? "correct"
                    : isPicked
                      ? "wrong"
                      : isAnswer
                        ? "reveal"
                        : "muted";
              return (
                <button
                  key={`${q.id}-${i}`}
                  type="button"
                  disabled={answered}
                  onClick={() => pick(i)}
                  className={cn(
                    "ring-line flex min-h-12 items-start gap-3 rounded-[16px] px-3.5 py-3 text-left ring-1 transition-[transform,background-color] duration-150",
                    state === "idle" && "bg-surface active:scale-[0.99]",
                    state === "correct" && "bg-ok-tint ring-ok/40",
                    state === "wrong" && "bg-wrong-tint ring-wrong/40",
                    state === "reveal" && "bg-ok-tint/50 ring-ok/25",
                    state === "muted" && "bg-surface opacity-45",
                  )}
                >
                  <span className="tabular text-caption text-ink-soft mt-0.5 w-5 font-bold">
                    {LETTERS[i]}
                  </span>
                  <span className="flex-1 text-[15px] leading-[20px] font-medium">
                    {option}
                  </span>
                  {!serverMode && state === "correct" ? (
                    <Check className="text-ok mt-0.5 size-4 shrink-0" aria-hidden />
                  ) : null}
                  {!serverMode && state === "wrong" ? (
                    <X className="text-wrong mt-0.5 size-4 shrink-0" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>

          {answered && !serverMode ? (
            <p className="text-small text-ink-soft mt-4">
              {correct ? copy.quiz.correct[0] : copy.quiz.wrong}
              {!correct && q.why ? ` ${q.why}` : ""}
            </p>
          ) : null}
          {submitError ? (
            <p className="text-caption text-wrong mt-3 font-semibold">{submitError}</p>
          ) : null}
        </div>
      </main>

      <BottomBar>
        <Button
          className="w-full"
          disabled={!answered || submitting}
          onClick={() => void next()}
        >
          {submitting
            ? copy.test.submitting
            : isLast
              ? copy.test.seeResult
              : copy.test.next}
        </Button>
      </BottomBar>
    </div>
  );
}
