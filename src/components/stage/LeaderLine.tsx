"use client";

import { dur } from "@/lib/motion";
import { m } from "motion/react";

type LeaderLineProps = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isVisible: boolean;
};

/**
 * LeaderLine: a short SVG line that "draws" itself using pathLength animation.
 * Kept under 120px per the motion spec (only used for short lines).
 * 250ms draw duration — this is an allowed paint-layer exception.
 */
export function LeaderLine({ x1, y1, x2, y2, isVisible }: LeaderLineProps) {
  return (
    <m.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#2B2420"
      strokeWidth="1"
      strokeOpacity="0.6"
      strokeDasharray="1"
      animate={{
        pathLength: isVisible ? 1 : 0,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{
        pathLength: { duration: dur.label, ease: "easeOut" },
        opacity: { duration: 0.1 },
      }}
      style={{ pointerEvents: "none" }}
    />
  );
}
