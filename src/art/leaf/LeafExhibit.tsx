import {
  BLADE,
  DewDrop,
  LeafBlade,
  LeafBladeDefs,
  LeafVeins,
  Twig,
} from "@/art/leaf/shape";
import type { ExhibitArtProps } from "@/content/types";

const PLACE = "translate(130 160) rotate(-24) scale(0.78)";

/** A leaf on a short twig: waxy blade, pinnate veins, one dew drop. */
export function LeafExhibit({ idPrefix, tone = "full", className }: ExhibitArtProps) {
  if (tone === "silhouette") {
    return (
      <svg viewBox="0 0 360 300" className={className} aria-hidden="true">
        <g transform={PLACE}>
          <path
            d="M-24 7 C-58 20 -96 40 -138 72"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
          <path d={BLADE} fill="currentColor" />
        </g>
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 360 300"
      className={className}
      role="img"
      aria-label="A green leaf on a twig"
    >
      <defs>
        <LeafBladeDefs idPrefix={idPrefix} />
        <radialGradient id={`${idPrefix}-cast`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2B2420" stopOpacity="0.18" />
          <stop offset="1" stopColor="#2B2420" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="186" cy="272" rx="136" ry="11" fill={`url(#${idPrefix}-cast)`} />
      <g transform={PLACE}>
        <Twig />
        <LeafBlade idPrefix={idPrefix} />
        <LeafVeins />
        <DewDrop idPrefix={idPrefix} />
      </g>
    </svg>
  );
}
