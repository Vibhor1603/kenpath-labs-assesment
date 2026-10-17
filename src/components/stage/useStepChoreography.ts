"use client";

import { type ChoreographyPhase, stepTimeline } from "@/lib/motion";
import { useEffect, useState } from "react";

/**
 * useStepChoreography: drives the choreography phases for a lesson step.
 * Returns the current phase and whether the mechanism loop should run.
 *
 * Remount the consumer with `key={stepId}` when the step changes so phase
 * resets to `"parts"` without syncing setState in an effect.
 *
 * Phase timeline (from motion.ts stepTimeline):
 *   0ms:    parts — SVG parts spring to step pose
 *   450ms:  focus — focused parts highlighted, others faded
 *   650ms:  labels — leader lines draw, labels fade in
 *   800ms:  text — sheet title + body appear
 *   1300ms: loop — refrigerant beads, heat shimmer, heartbeat run
 */
export function useStepChoreography(stepId: string): {
  phase: ChoreographyPhase;
  isLoopActive: boolean;
} {
  const [phase, setPhase] = useState<ChoreographyPhase>("parts");

  useEffect(() => {
    const t1 = setTimeout(
      () => setPhase("focus"),
      stepTimeline.focusAtMs,
    );
    const t2 = setTimeout(
      () => setPhase("labels"),
      stepTimeline.labelsAtMs,
    );
    const t3 = setTimeout(
      () => setPhase("text"),
      stepTimeline.textAtMs,
    );
    const t4 = setTimeout(
      () => setPhase("loop"),
      stepTimeline.loopAtMs,
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [stepId]);

  const isLoopActive = phase === "loop";

  return { phase, isLoopActive };
}
