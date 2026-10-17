"use client";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { cn } from "@/lib/utils";

type PointsChipProps = {
  points: number;
  className?: string;
};

/**
 * PointsChip: Fraunces tabular points number in Kiln color.
 * The number animates up when points increase.
 * Tapping opens the badge sheet (handled by parent via BadgeSheet).
 */
export function PointsChip({ points, className }: PointsChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1",
        "bg-card border border-border/50",
        "select-none cursor-default",
        className,
      )}
      aria-label={`${points} Kenpath Points`}
    >
      <AnimatedNumber
        value={points}
        className="font-display text-[15px] font-[600] leading-none text-primary tabular-nums"
        springOptions={{ stiffness: 120, damping: 20 }}
      />
      <span className="text-[12px] font-medium text-muted-foreground leading-none">
        pts
      </span>
    </span>
  );
}
