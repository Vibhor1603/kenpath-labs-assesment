"use client";

import { Label } from "@/components/stage/Label";
import { LeaderLine } from "@/components/stage/LeaderLine";
import type { ChoreographyPhase } from "@/lib/motion";
import type { Label as LabelType } from "@/content/types";

type StageLabelsProps = {
  labels: LabelType[];
  phase: ChoreographyPhase;
  svgWidth?: number;
  svgHeight?: number;
};

/**
 * StageLabels: renders leader lines + text labels for the current step.
 * Labels are visible once the "labels" phase begins (650ms into step).
 */
export function StageLabels({
  labels,
  phase,
}: StageLabelsProps) {
  const isVisible =
    phase === "labels" || phase === "text" || phase === "loop";

  return (
    <>
      {labels.map((label) => {
        const { x, y } = label.anchor;
        const side = label.side;

        // Short leader line endpoint offsets
        const lx2 = side === "left" ? x - 8 : side === "right" ? x + 8 : x;
        const ly2 = side === "top" ? y - 8 : side === "bottom" ? y + 8 : y;

        return (
          <g key={`${label.partId}-${label.text}`}>
            <LeaderLine
              x1={x}
              y1={y}
              x2={lx2}
              y2={ly2}
              isVisible={isVisible}
            />
            <Label
              text={label.text}
              x={x}
              y={y}
              side={side}
              isVisible={isVisible}
            />
          </g>
        );
      })}
    </>
  );
}
