"use client";

import type { ViewState } from "@/hooks/useView";
import { cn } from "@/lib/utils";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import type { ReactNode } from "react";

type TopBarProps = {
  view: ViewState;
  totalSteps?: number;
  pointsChip?: ReactNode;
  sprout?: ReactNode;
  isDemo?: boolean;
  onBack?: () => void;
};

/**
 * TopBar: 56px + safe-area-inset-top.
 * Home view: wordmark on the left, points + sprout on the right.
 * Lesson/test view: back button + step dots on the left, points + sprout on the right.
 */
export function TopBar({
  view,
  totalSteps,
  pointsChip,
  sprout,
  isDemo = false,
  onBack,
}: TopBarProps) {
  const isLesson = view.name === "lesson";
  const currentStep = isLesson ? view.step : undefined;

  return (
    <header
      className={cn(
        "relative flex w-full items-center justify-between gap-3 px-4",
        "h-[calc(56px+env(safe-area-inset-top))]",
        "pt-[env(safe-area-inset-top)]",
        "bg-background border-b border-border/40",
      )}
      aria-label="Top navigation"
    >
      {/* Left side */}
      <div className="flex items-center gap-2 min-w-0">
        {isLesson && onBack ? (
          <>
            <button
              onClick={onBack}
              className={cn(
                "flex items-center justify-center rounded-full",
                "size-12 -ml-2",
                "text-foreground hover:bg-muted active:scale-95 transition-transform",
              )}
              aria-label="Go back"
            >
              <ArrowLeft className="size-5" />
            </button>

            {/* Step dots */}
            {totalSteps && currentStep ? (
              <StepDots current={currentStep} total={totalSteps} />
            ) : null}
          </>
        ) : (
          <Wordmark />
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        {isDemo && <DemoChip />}
        {sprout}
        {pointsChip}
      </div>
    </header>
  );
}

function Wordmark() {
  return (
    <span className="font-display text-[20px] font-[600] leading-none text-foreground truncate">
      How Things Work
    </span>
  );
}

type StepDotsProps = { current: number; total: number };

function StepDots({ current, total }: StepDotsProps) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Step ${current} of ${total}`}
      role="status"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full transition-all duration-200",
            i + 1 === current
              ? "size-2 bg-foreground"
              : i + 1 < current
                ? "size-1.5 bg-muted-foreground"
                : "size-1.5 bg-border",
          )}
        />
      ))}
    </div>
  );
}

function DemoChip() {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5",
        "bg-accent text-accent-foreground text-[12px] font-medium leading-none",
        "border border-border/60",
      )}
      aria-label="Demo mode active"
    >
      Demo
    </span>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _MoreButton() {
  return (
    <button
      className="flex items-center justify-center size-10 rounded-full hover:bg-muted"
      aria-label="More options"
    >
      <MoreHorizontal className="size-4 text-muted-foreground" />
    </button>
  );
}
