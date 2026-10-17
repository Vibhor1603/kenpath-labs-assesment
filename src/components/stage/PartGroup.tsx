"use client";

import type { PartPose } from "@/content/types";
import { spring } from "@/lib/motion";
import { m } from "motion/react";
import type { ReactNode } from "react";

type PartGroupProps = {
  id: string;
  pose?: PartPose;
  /** Transform origin in SVG fill-box space, e.g. "center", "left center". */
  transformOrigin?: string;
  children: ReactNode;
  /** Extra inline styles (e.g. initial visibility). */
  style?: React.CSSProperties;
};

/**
 * PartGroup: an animated SVG <g> element for a single art part.
 * Uses Motion spring.part for all transform animations.
 * Always has transformBox: fill-box so the origin is relative to the element.
 */
export function PartGroup({
  id,
  pose,
  transformOrigin = "center",
  children,
  style,
}: PartGroupProps) {
  const animate = {
    x: pose?.x ?? 0,
    y: pose?.y ?? 0,
    scale: pose?.scale ?? 1,
    rotate: pose?.rotate ?? 0,
    opacity: pose?.opacity ?? 1,
    ...(pose?.scaleX !== undefined ? { scaleX: pose.scaleX } : {}),
    ...(pose?.skewY !== undefined ? { skewY: pose.skewY } : {}),
  };

  return (
    <m.g
      id={`part-${id}`}
      animate={animate}
      transition={spring.part}
      style={{
        transformBox: "fill-box",
        transformOrigin,
        ...style,
      }}
    >
      {children}
    </m.g>
  );
}
