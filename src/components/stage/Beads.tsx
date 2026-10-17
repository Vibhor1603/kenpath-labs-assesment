"use client";

import { useEffect, useRef } from "react";
import { m, useAnimationControls } from "motion/react";

type Bead = {
  id: string;
  /** CSS color. */
  color: string;
  /** Path element ref for sampling. */
  pathRef: React.RefObject<SVGPathElement | null>;
  delay?: number;
};

type BeadsProps = {
  beads: Bead[];
  /** Number of keyframe points along the path. */
  numPoints?: number;
  duration?: number;
  isActive?: boolean;
  radius?: number;
};

/**
 * Beads: animates small colored circles along an SVG path.
 * Samples 32 points via getPointAtLength, then loops x/y keyframes.
 * Transform only — no SVG attribute animation.
 */
export function Beads({
  beads,
  numPoints = 32,
  duration = 4,
  isActive = true,
  radius = 4,
}: BeadsProps) {
  return (
    <>
      {beads.map((bead) => (
        <SingleBead
          key={bead.id}
          bead={bead}
          numPoints={numPoints}
          duration={duration}
          isActive={isActive}
          radius={radius}
        />
      ))}
    </>
  );
}

function SingleBead({
  bead,
  numPoints,
  duration,
  isActive,
  radius,
}: {
  bead: Bead;
  numPoints: number;
  duration: number;
  isActive: boolean;
  radius: number;
}) {
  const controls = useAnimationControls();
  const sampledRef = useRef<{ x: number[]; y: number[] } | null>(null);

  useEffect(() => {
    const path = bead.pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    const xs: number[] = [];
    const ys: number[] = [];

    for (let i = 0; i <= numPoints; i++) {
      const pt = path.getPointAtLength((i / numPoints) * len);
      xs.push(pt.x);
      ys.push(pt.y);
    }
    sampledRef.current = { x: xs, y: ys };
  }, [bead.pathRef, numPoints]);

  useEffect(() => {
    if (!isActive || !sampledRef.current) return;

    const { x, y } = sampledRef.current;
    const delay = bead.delay ?? 0;

    controls.start({
      x,
      y,
      transition: {
        duration,
        delay,
        ease: "linear",
        repeat: Infinity,
      },
    });

    return () => { controls.stop(); };
  }, [isActive, controls, duration, bead.delay]);

  useEffect(() => {
    if (!isActive) controls.stop();
  }, [isActive, controls]);

  return (
    <m.circle
      r={radius}
      fill={bead.color}
      stroke="#FBF5EC"
      strokeWidth="1"
      animate={controls}
      initial={{ x: 0, y: 0 }}
      style={{ pointerEvents: "none" }}
    />
  );
}
