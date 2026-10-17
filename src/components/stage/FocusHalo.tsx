"use client";

import { m } from "motion/react";

type FocusHaloProps = {
  /** Center of the halo in SVG coordinates. */
  cx: number;
  cy: number;
  /** Radius of the halo ellipse. */
  rx?: number;
  ry?: number;
  isVisible: boolean;
};

/**
 * FocusHalo: a static warm glow behind the focused part.
 * Opacity animates in/out when the focused part changes.
 * No filter — uses a radial gradient shape for performance.
 */
export function FocusHalo({
  cx,
  cy,
  rx = 70,
  ry = 80,
  isVisible,
}: FocusHaloProps) {
  return (
    <m.ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill="url(#focus-halo-gradient)"
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: "none" }}
    />
  );
}

/** Reusable gradient definition — add once to SVG <defs>. */
export function FocusHaloDef() {
  return (
    <radialGradient id="focus-halo-gradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#FFF3E0" stopOpacity="0.55" />
      <stop offset="100%" stopColor="#FFF3E0" stopOpacity="0" />
    </radialGradient>
  );
}
