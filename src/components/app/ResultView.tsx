"use client";

import { copy } from "@/content/copy";
import { getDiscovery } from "@/content/index";
import type { DiscoveryId } from "@/content/types";
import { PERFECT_SCORE } from "@/lib/scoring";

type ResultViewProps = {
  discoveryId: DiscoveryId;
  score: number;
  onTryAgain: () => void;
  onWatchLesson: () => void;
};

/**
 * ResultView: shown after a non-perfect test attempt.
 * Score, encouraging message, "Try again" (primary) and "Watch the lesson again" (secondary).
 */
export function ResultView({
  discoveryId,
  score,
  onTryAgain,
  onWatchLesson,
}: ResultViewProps) {
  const discovery = getDiscovery(discoveryId);
  const total = PERFECT_SCORE;
  const isClose = score === total - 1;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center gap-6">
      {/* Score display */}
      <div className="flex flex-col items-center gap-2">
        <div className="font-display text-[44px] font-[600] leading-none text-primary">
          {score}/{total}
        </div>
        <p className="text-[17px] text-muted-foreground">
          {copy.result.scoreLine(score, total)}
        </p>
        {isClose ? (
          <p className="text-[15px] font-medium text-muted-foreground">
            {copy.result.almost}
          </p>
        ) : (
          <p className="text-[15px] text-muted-foreground">
            {copy.result.needPerfect}
          </p>
        )}
        {discovery && (
          <p className="text-[13px] text-muted-foreground opacity-70">
            {discovery.title}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex w-full flex-col gap-3">
        <button
          onClick={onTryAgain}
          className="flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-[17px] font-medium text-primary-foreground active:scale-[0.97] transition-transform"
        >
          {copy.result.tryAgain}
        </button>
        <button
          onClick={onWatchLesson}
          className="flex h-12 w-full items-center justify-center rounded-full bg-card px-6 text-[17px] font-medium text-foreground border border-border/50 active:scale-[0.97] transition-transform"
        >
          {copy.result.watchLessonAgain}
        </button>
      </div>
    </div>
  );
}
