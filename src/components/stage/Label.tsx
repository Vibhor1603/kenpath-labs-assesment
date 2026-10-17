"use client";

import { dur } from "@/lib/motion";
import { m } from "motion/react";

type LabelProps = {
  text: string;
  /** Anchor point in SVG coordinates. */
  x: number;
  y: number;
  side: "left" | "right" | "top" | "bottom";
  isVisible: boolean;
};

const OFFSET = 28;

function getTextAnchor(side: LabelProps["side"]): "start" | "middle" | "end" {
  if (side === "left") return "end";
  if (side === "right") return "start";
  return "middle";
}

function getDy(side: LabelProps["side"]): number {
  if (side === "top") return -OFFSET;
  if (side === "bottom") return OFFSET;
  return 0;
}

function getDx(side: LabelProps["side"]): number {
  if (side === "left") return -OFFSET;
  if (side === "right") return OFFSET;
  return 0;
}

/**
 * Label: a text label that fades + slides in above its anchor.
 * Has a paper-colored halo so it reads over busy art.
 * Uses font-variant-numeric tabular-nums via CSS.
 */
export function Label({ text, x, y, side, isVisible }: LabelProps) {
  const tx = x + getDx(side);
  const ty = y + getDy(side);
  const anchor = getTextAnchor(side);

  return (
    <m.g
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 6 }}
      transition={{ duration: dur.label, ease: "easeOut" }}
      style={{ pointerEvents: "none" }}
    >
      {/* Paper halo for legibility over art */}
      <text
        x={tx}
        y={ty}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontSize="13"
        fontFamily="var(--font-inter)"
        fontWeight="600"
        stroke="#FBF5EC"
        strokeWidth="5"
        paintOrder="stroke"
        fill="#2B2420"
      >
        {text}
      </text>
      {/* Foreground text */}
      <text
        x={tx}
        y={ty}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontSize="13"
        fontFamily="var(--font-inter)"
        fontWeight="600"
        fill="#2B2420"
      >
        {text}
      </text>
    </m.g>
  );
}
