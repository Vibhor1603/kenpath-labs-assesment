import { HeartDefs, HeartExterior, OUTER, VesselStumps, vessel } from "@/art/heart/shape";
import type { ExhibitArtProps } from "@/content/types";

const VIEW = "70 50 300 420";

/** An anatomical heart model with vessel stumps, lit from the upper left. */
export function HeartExhibit({ idPrefix, tone = "full", className }: ExhibitArtProps) {
  if (tone === "silhouette") {
    return (
      <svg viewBox={VIEW} className={className} aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path d="M126 112 V226" strokeWidth="26" />
          <path d="M213 306 V152 C213 102 338 102 338 152 V196" strokeWidth="26" />
          <path d="M184 306 V158 C184 136 176 124 164 116" strokeWidth="24" />
          {vessel.branches.map((d) => (
            <path key={d} d={d} strokeWidth="10" />
          ))}
        </g>
        <path d={OUTER} fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg
      viewBox={VIEW}
      className={className}
      role="img"
      aria-label="A model of a human heart"
    >
      <defs>
        <HeartDefs idPrefix={idPrefix} />
      </defs>
      <ellipse cx="226" cy="452" rx="96" ry="10" fill={`url(#${idPrefix}-contact)`} />
      <VesselStumps />
      <HeartExterior idPrefix={idPrefix} />
    </svg>
  );
}
