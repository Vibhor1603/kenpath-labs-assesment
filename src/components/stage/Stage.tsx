"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { swipe } from "@/lib/tokens";

type StageProps = {
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  className?: string;
};

/**
 * Stage: the main lesson art area.
 * Height: calc(58svh - 56px) — uses svh so it never resizes when toolbar moves.
 * Supports drag="x" swipe navigation:
 *   - swipe left (or velocity < -400) = next step
 *   - swipe right (or velocity > 400) = back
 * Each gesture has a button twin in the bottom bar.
 */
export function Stage({ children, onNext, onBack, className }: StageProps) {
  return (
    <div
      className={`relative overflow-hidden bg-background ${className ?? ""}`}
      style={{ height: "calc(58svh - 56px)" }}
    >
      {/* Paper grain overlay (static, low opacity) */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          backgroundImage:
            "url('/grain.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
          opacity: 0.05,
          mixBlendMode: "multiply",
        }}
      />

      {/* Swipe-capture layer */}
      <m.div
        className="absolute inset-0 z-0 touch-pan-y"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={swipe.elastic}
        onDragEnd={(_e, info) => {
          const { offset, velocity } = info;
          if (offset.x < -swipe.offsetPx || velocity.x < -swipe.velocity) {
            onNext?.();
          } else if (offset.x > swipe.offsetPx || velocity.x > swipe.velocity) {
            onBack?.();
          }
        }}
      >
        {children}
      </m.div>
    </div>
  );
}
