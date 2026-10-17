import { OUTER } from "@/art/heart/shape";
import { BLADE } from "@/art/leaf/shape";
import type { DiscoveryId } from "@/content/types";

const SKETCH: Record<
  DiscoveryId,
  { viewBox: string; paths: { d: string; transform?: string }[] }
> = {
  fridge: {
    viewBox: "0 0 240 470",
    paths: [
      {
        d: "M44 30 Q44 18 56 18 H184 Q196 18 196 30 V430 Q196 442 184 442 H56 Q44 442 44 430 Z",
      },
      { d: "M44 150 H196" },
      { d: "M170 60 V120 M170 190 V300" },
    ],
  },
  leaf: {
    viewBox: "0 0 360 300",
    paths: [
      { d: BLADE, transform: "translate(130 160) rotate(-24) scale(0.78)" },
      {
        d: "M-24 7 L0 0 Q150 -4 296 0",
        transform: "translate(130 160) rotate(-24) scale(0.78)",
      },
    ],
  },
  heart: {
    viewBox: "70 50 300 420",
    paths: [
      { d: OUTER },
      { d: "M184 300 V158 M213 300 V152 C213 102 338 102 338 152 V196 M126 112 V226" },
    ],
  },
};

/** A pencil outline of the object drawing itself while the lesson chunk loads. */
export function SketchLoader({ id }: { id: DiscoveryId }) {
  const sketch = SKETCH[id];
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      role="status"
      aria-label="Loading the lesson"
    >
      <svg viewBox={sketch.viewBox} className="h-[62%] w-auto" aria-hidden="true">
        {sketch.paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            transform={p.transform}
            pathLength={1}
            fill="none"
            stroke="var(--ink-soft)"
            strokeOpacity="0.55"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="1"
            style={{
              animation: `sketch-draw 1.2s var(--ease-in-out) ${i * 0.12}s infinite alternate both`,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
