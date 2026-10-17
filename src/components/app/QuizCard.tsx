"use client";

import { cn } from "@/lib/utils";
import { m } from "motion/react";
import { CheckCircle, XCircle } from "lucide-react";

type QuizCardState = "idle" | "selected" | "correct" | "wrong" | "revealed";

type QuizCardProps = {
  text: string;
  state: QuizCardState;
  onSelect: () => void;
  index: number;
};

/**
 * QuizCard: a full-width answer card.
 * 64px minimum height, Sand fill, 16px radius.
 * Correct: deep teal edge + check icon.
 * Wrong: deep berry edge + x icon + 2-cycle shake.
 * Feedback never relies on color alone.
 */
export function QuizCard({ text, state, onSelect, index }: QuizCardProps) {
  const isLocked = state !== "idle";
  const isCorrect = state === "correct";
  const isWrong = state === "wrong";
  const isRevealed = state === "revealed";
  const isSelected = state === "selected";

  // shake keyframes are used in the animate prop below
  void (isWrong ? { x: [0, -6, 6, -6, 6, 0] } : {});

  return (
    <m.button
      onClick={isLocked ? undefined : onSelect}
      disabled={isLocked}
      animate={
        isWrong
          ? { x: [0, -6, 6, -6, 6, 0] }
          : { x: 0 }
      }
      transition={
        isWrong
          ? { duration: 0.3, ease: "easeInOut" }
          : {}
      }
      className={cn(
        "relative flex w-full min-h-[64px] items-center gap-3 rounded-[16px] px-4 py-3",
        "border text-left text-[17px] leading-snug",
        "touch-manipulation transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        // Base state
        !isLocked && "bg-card border-border/50 hover:border-border active:scale-[0.98]",
        // Selected (before reveal)
        isSelected && "bg-card border-foreground/30",
        // Correct
        (isCorrect || isRevealed) && "bg-card border-[#1F6672]",
        // Wrong
        isWrong && "bg-card border-[#A3384B]",
        // Disabled (other options after lock)
        isLocked && !isCorrect && !isWrong && !isRevealed && "opacity-50",
      )}
      aria-label={`Option ${index + 1}: ${text}`}
    >
      {/* Status icon */}
      {(isCorrect || isRevealed) && (
        <CheckCircle
          className="size-5 shrink-0 text-[#1F6672]"
          aria-hidden="true"
        />
      )}
      {isWrong && (
        <XCircle
          className="size-5 shrink-0 text-[#A3384B]"
          aria-hidden="true"
        />
      )}
      {!isCorrect && !isWrong && !isRevealed && (
        <span
          className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border/60 text-[12px] font-medium text-muted-foreground"
        >
          {String.fromCharCode(65 + index)}
        </span>
      )}

      <span
        className={cn(
          "flex-1",
          (isCorrect || isRevealed) && "text-[#1F6672] font-medium",
          isWrong && "text-[#A3384B]",
        )}
      >
        {text}
      </span>
    </m.button>
  );
}
