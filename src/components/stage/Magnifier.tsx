"use client";

import { m } from "motion/react";
import { spring } from "@/lib/motion";

type MagnifierProps = {
  cx: number;
  cy: number;
  radius?: number;
  isVisible: boolean;
};

/**
 * Magnifier: a circular magnifier inset shown in fridge step 5.
 * Scales in from 0.94 and clips the content area.
 * The enlarged content inside must be rendered by the art component.
 */
export function Magnifier({ cx, cy, radius = 48, isVisible }: MagnifierProps) {
  const clipId = "magnifier-clip";

  return (
    <m.g
      animate={{
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.94,
      }}
      transition={spring.ui}
      style={{ transformBox: "fill-box", transformOrigin: `${cx}px ${cy}px` }}
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx={cx} cy={cy} r={radius} />
        </clipPath>
      </defs>

      {/* Lens glass */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill="#CFE4EC"
        fillOpacity="0.18"
        stroke="#2B2420"
        strokeWidth="2"
      />

      {/* Subtle highlight */}
      <ellipse
        cx={cx - radius * 0.25}
        cy={cy - radius * 0.3}
        rx={radius * 0.35}
        ry={radius * 0.2}
        fill="#FFF3E0"
        fillOpacity="0.3"
      />

      {/* Handle */}
      <line
        x1={cx + radius * 0.7}
        y1={cy + radius * 0.7}
        x2={cx + radius * 1.3}
        y2={cy + radius * 1.3}
        stroke="#5E554D"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </m.g>
  );
}
