"use client";

import { cn } from "@/lib/utils";

type StreakSproutProps = {
  streakCount: number;
  className?: string;
};

/**
 * StreakSprout: an SVG potted sprout.
 * Leaves grow one-by-one via data-leaves attribute (0-3).
 * A small flower appears at streak 3+.
 */
export function StreakSprout({ streakCount, className }: StreakSproutProps) {
  const leaves = Math.min(3, Math.max(0, streakCount));
  const hasFlower = streakCount >= 3;

  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-label={`Streak: ${streakCount} day${streakCount !== 1 ? "s" : ""}`}
      data-leaves={leaves}
    >
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
        {/* Pot */}
        <rect x="8" y="22" width="12" height="8" rx="2" fill="#C9A96E" />
        <rect x="7" y="20" width="14" height="3" rx="1.5" fill="#B08B55" />
        {/* Soil */}
        <rect x="9" y="23" width="10" height="2" rx="1" fill="#2B1A0D" opacity="0.3" />

        {/* Stem */}
        <path d="M14 21 L14 14" stroke="#3E7D4A" strokeWidth="1.5" strokeLinecap="round" />

        {/* Leaf 1 (left, always shown when count >= 1) */}
        {leaves >= 1 && (
          <path
            d="M14 18 C10 16 8 12 10 10 C12 8 14 12 14 14 Z"
            fill="#3E7D4A"
            opacity="0.9"
          />
        )}

        {/* Leaf 2 (right, shown when count >= 2) */}
        {leaves >= 2 && (
          <path
            d="M14 15 C18 13 20 9 18 7 C16 5 14 9 14 11 Z"
            fill="#2F6A3B"
            opacity="0.9"
          />
        )}

        {/* Leaf 3 (left, shown when count >= 3) */}
        {leaves >= 3 && (
          <path
            d="M14 12 C10 10 8 6 10 4 C12 2 14 6 14 8 Z"
            fill="#3E7D4A"
            opacity="0.85"
          />
        )}

        {/* Flower at streak 3+ */}
        {hasFlower && (
          <g>
            <circle cx="14" cy="4" r="3" fill="#F6C9A8" />
            <circle cx="14" cy="4" r="1.5" fill="#F7E3A1" />
            <circle cx="11" cy="4" r="1.5" fill="#F6C9A8" opacity="0.7" />
            <circle cx="17" cy="4" r="1.5" fill="#F6C9A8" opacity="0.7" />
            <circle cx="14" cy="1" r="1.5" fill="#F6C9A8" opacity="0.7" />
          </g>
        )}
      </svg>
    </span>
  );
}
