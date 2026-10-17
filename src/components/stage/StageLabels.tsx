import type { PlacedLabel, Size } from "@/components/stage/geometry";
import { stepTimeline } from "@/lib/motion";
import { cn } from "@/lib/utils";

type StageLabelsProps = {
  placed: PlacedLabel[];
  stage: Size;
};

/** Leader lines, anchor dots and label pills, drawn in screen space after the camera move. */
export function StageLabels({ placed, stage }: StageLabelsProps) {
  const delay = (i: number) => stepTimeline.labelsAtMs + i * stepTimeline.labelStaggerMs;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <svg className="absolute inset-0" width={stage.w} height={stage.h}>
        {placed.map((p, i) =>
          p.line ? (
            <line
              key={`l-${p.label.text}`}
              x1={p.line.x1}
              y1={p.line.y1}
              x2={p.line.x2}
              y2={p.line.y2}
              stroke="var(--ink)"
              strokeWidth={1.25}
              strokeLinecap="round"
              strokeDasharray={p.line.len}
              className="calm-fade"
              style={{
                ["--len" as string]: p.line.len,
                strokeDashoffset: 0,
                animation: `leader-draw 250ms var(--ease-out) ${delay(i)}ms both`,
              }}
            />
          ) : null,
        )}
        {placed.map((p, i) => (
          <g
            key={`d-${p.label.text}`}
            transform={`translate(${p.anchor.x} ${p.anchor.y})`}
          >
            <circle
              r={4.5}
              fill="var(--ink)"
              stroke="var(--surface)"
              strokeWidth={2}
              className="calm-fade"
              style={{
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `dot-in 220ms var(--spring-press) ${delay(i) - 60}ms both`,
              }}
            />
          </g>
        ))}
      </svg>
      {placed.map((p, i) => (
        <span
          key={`p-${p.label.text}`}
          className={cn(
            "anim-rise-in absolute flex items-center justify-center rounded-full text-[14px] leading-none font-semibold whitespace-nowrap",
            p.label.isPartName
              ? "bg-ink text-surface shadow-[var(--shadow-md)]"
              : "border-line bg-surface text-ink border shadow-[var(--shadow-sm)]",
          )}
          style={{
            left: p.pill.x,
            top: p.pill.y,
            width: p.pill.w,
            height: p.pill.h,
            animationDelay: `${delay(i) + 120}ms`,
          }}
        >
          {p.label.text}
        </span>
      ))}
    </div>
  );
}
