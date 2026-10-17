"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

export type FlowSegment = {
  id: string;
  d: string;
  /** Bead colour at the start of the segment. */
  from: string;
  /** Bead colour at the end; beads crossfade along the way (opacity only). */
  to?: string;
  count: number;
  ms: number;
};

type FlowBeadsProps = {
  segments: readonly FlowSegment[];
  playing: boolean;
  reduced: boolean;
  lite: boolean;
  r?: number;
};

const SAMPLES = 32;

/**
 * Beads that travel along fixed paths. Each path is sampled once, then every
 * bead runs a looping transform keyframe animation (Web Animations API).
 * Reduced motion: beads stand still at even spacing.
 */
export function FlowBeads({ segments, playing, reduced, lite, r = 3.6 }: FlowBeadsProps) {
  const pathRefs = useRef<Map<string, SVGPathElement>>(new Map());
  const beadRefs = useRef<Map<string, SVGGElement>>(new Map());
  const topRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  const animsRef = useRef<Animation[]>([]);
  const playingRef = useRef(playing);

  useEffect(() => {
    playingRef.current = playing;
    for (const a of animsRef.current) {
      if (playing) a.play();
      else a.pause();
    }
  }, [playing]);

  useLayoutEffect(() => {
    const anims: Animation[] = [];
    for (const seg of segments) {
      const path = pathRefs.current.get(seg.id);
      if (!path) continue;
      const len = path.getTotalLength();
      const count = lite ? Math.max(1, Math.ceil(seg.count / 2)) : seg.count;
      const points = Array.from({ length: SAMPLES + 1 }, (_, i) =>
        path.getPointAtLength((len * i) / SAMPLES),
      );
      for (let i = 0; i < count; i++) {
        const bead = beadRefs.current.get(`${seg.id}-${i}`);
        const top = topRefs.current.get(`${seg.id}-${i}`);
        if (!bead) continue;
        const phase = (i + 0.5) / count;
        if (reduced || typeof bead.animate !== "function") {
          const p = path.getPointAtLength(len * phase);
          bead.style.transform = `translate(${p.x}px, ${p.y}px)`;
          if (top) top.style.opacity = String(1 - phase);
          continue;
        }
        const timing: KeyframeAnimationOptions = {
          duration: seg.ms,
          iterations: Infinity,
          delay: -phase * seg.ms,
          easing: "linear",
        };
        anims.push(
          bead.animate(
            points.map((p) => ({
              transform: `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px)`,
            })),
            timing,
          ),
        );
        if (top) {
          anims.push(
            top.animate(
              [
                { opacity: 1, offset: 0 },
                { opacity: 1, offset: 0.12 },
                { opacity: 0, offset: 0.88 },
                { opacity: 0, offset: 1 },
              ],
              timing,
            ),
          );
        }
      }
    }
    if (!playingRef.current) anims.forEach((a) => a.pause());
    animsRef.current = anims;
    return () => {
      anims.forEach((a) => a.cancel());
      animsRef.current = [];
    };
  }, [segments, reduced, lite]);

  return (
    <g aria-hidden="true">
      {segments.map((seg) => {
        const count = lite ? Math.max(1, Math.ceil(seg.count / 2)) : seg.count;
        return (
          <g key={seg.id}>
            <path
              ref={(el) => {
                if (el) pathRefs.current.set(seg.id, el);
                else pathRefs.current.delete(seg.id);
              }}
              d={seg.d}
              fill="none"
              stroke="none"
            />
            {Array.from({ length: count }, (_, i) => (
              <g
                key={i}
                ref={(el) => {
                  const k = `${seg.id}-${i}`;
                  if (el) beadRefs.current.set(k, el);
                  else beadRefs.current.delete(k);
                }}
              >
                <circle r={r} fill={seg.to ?? seg.from} />
                {seg.to ? (
                  <circle
                    r={r}
                    fill={seg.from}
                    ref={(el) => {
                      const k = `${seg.id}-${i}`;
                      if (el) topRefs.current.set(k, el);
                      else topRefs.current.delete(k);
                    }}
                  />
                ) : null}
                <circle
                  r={r * 0.36}
                  cx={-r * 0.34}
                  cy={-r * 0.36}
                  fill="#fff"
                  opacity={0.55}
                />
              </g>
            ))}
          </g>
        );
      })}
    </g>
  );
}
