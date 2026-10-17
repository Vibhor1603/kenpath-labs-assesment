"use client";

import { FlowBeads, type FlowSegment } from "@/art/FlowBeads";
import {
  DewDrop,
  LeafBlade,
  LeafBladeDefs,
  LeafVeins,
  MIDRIB_LINE,
  Twig,
} from "@/art/leaf/shape";
import { makePart, type PartContext } from "@/art/parts";
import type { LessonArtProps } from "@/content/types";
import { artPalette as c } from "@/lib/tokens";
import { useMemo } from "react";

export const viewBox = { w: 400, h: 500 } as const;

export const legend = [
  { color: c.water, label: "Water" },
  { color: "#4A4D52", label: "Carbon dioxide" },
  { color: "#8DC6E0", label: "Oxygen" },
  { color: c.sugar, label: "Sugar" },
] as const;

export const legendSteps = [1, 2, 3];

const T = { tx: 120, ty: 190, rot: -24, s: 0.86 };
const PLACE = `translate(${T.tx} ${T.ty}) rotate(${T.rot}) scale(${T.s})`;

function toGlobal(x: number, y: number) {
  const r = (T.rot * Math.PI) / 180;
  const X = x * T.s;
  const Y = y * T.s;
  return {
    x: T.tx + X * Math.cos(r) - Y * Math.sin(r),
    y: T.ty + X * Math.sin(r) + Y * Math.cos(r),
  };
}

const CUT_A = toGlobal(150, -58);
const CUT_B = toGlobal(150, 50);

const S = { x0: 30, x1: 370, y0: 312 } as const;
const STOMATA = [110, 290];

const HIDDEN = new Set([
  "sun-rays",
  "cut-line",
  "slab",
  "water",
  "co2",
  "oxygen",
  "sugar",
  "chloro-glow",
  "chloroplasts",
  "stomata",
]);
const CONTEXT_PARTS = new Set(["twig", "leaf-blade", "slab"]);

const WATER: FlowSegment[] = [
  { id: "midrib", d: MIDRIB_LINE, from: c.water, count: 7, ms: 5200 },
];

const PALISADE = Array.from({ length: 17 }, (_, i) => S.x0 + i * 20);
const CHLORO_SPOTS = [
  [5.5, 342],
  [14.5, 349],
  [5.5, 358],
  [14.5, 366],
  [5.5, 375],
] as const;

const SPONGY = (() => {
  const cells: { x: number; y: number; r: number }[] = [];
  const rows = [398, 419, 438];
  rows.forEach((y, row) => {
    for (let k = 0; k < 14; k++) {
      const x = S.x0 + 14 + k * 25 + (row % 2 ? 12 : 0) + ((k * 7 + row * 3) % 5) - 2;
      if (x > S.x1 - 10) continue;
      if (Math.abs(x - 200) < 32 && y < 440) continue;
      if (y > 428 && STOMATA.some((s) => Math.abs(x - s) < 16)) continue;
      cells.push({ x, y: y + ((k + row) % 3) - 1, r: 9.5 + ((k + row) % 3) });
    }
  });
  return cells;
})();

function Hexagon({ x, y, r = 5 }: { x: number; y: number; r?: number }) {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    return `${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return <polygon points={pts} fill={c.sugar} stroke="#A87A22" strokeWidth="1" />;
}

function CO2({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="-6.5" r="3.2" fill="#ECE6DC" stroke="#8E877C" strokeWidth="0.8" />
      <circle cx="6.5" r="3.2" fill="#ECE6DC" stroke="#8E877C" strokeWidth="0.8" />
      <circle r="4.2" fill="#4A4D52" />
    </g>
  );
}

function O2({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx="-3" r="3.6" fill="#BFE0EE" stroke="#3D8FB0" strokeWidth="0.9" />
      <circle cx="3" r="3.6" fill="#BFE0EE" stroke="#3D8FB0" strokeWidth="0.9" />
    </g>
  );
}

export default function LeafLesson({
  idPrefix,
  focus,
  pose,
  playing,
  reduced,
  lite,
}: LessonArtProps) {
  const ctx: PartContext = useMemo(
    () => ({ focus, pose, reduced, hidden: HIDDEN, context: CONTEXT_PARTS }),
    [focus, pose, reduced],
  );
  const part = makePart(ctx);
  const id = (s: string) => `${idPrefix}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;

  return (
    <svg
      viewBox="0 0 400 500"
      className="block h-full w-full overflow-visible"
      role="img"
      aria-label="A leaf with a cross-section showing the cells inside"
    >
      <defs>
        <LeafBladeDefs idPrefix={idPrefix} />
        <radialGradient id={id("sun")} cx="0" cy="0" r="1">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={id("ray")}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="260"
          y2="180"
        >
          <stop offset="0" stopColor="#FBD879" stopOpacity="0.85" />
          <stop offset="1" stopColor="#FBD879" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("slab-top")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5F9A56" />
          <stop offset="1" stopColor="#3F7F48" />
        </linearGradient>
        <clipPath id={id("slab-clip")}>
          <rect x={S.x0} y={S.y0} width={S.x1 - S.x0} height="150" rx="8" />
        </clipPath>
      </defs>

      <g {...part("sun-rays")}>
        <circle cx="0" cy="0" r="120" fill={url("sun")} />
        {[
          [250, 120],
          [200, 170],
          [300, 70],
          [150, 200],
        ].map(([x, y], i) => (
          <line
            key={i}
            x1="0"
            y1="0"
            x2={x}
            y2={y}
            stroke={url("ray")}
            strokeWidth={i === 0 ? 16 : 10}
            strokeLinecap="round"
          />
        ))}
      </g>

      <g transform={PLACE}>
        <g {...part("twig")}>
          <Twig />
        </g>
        <g {...part("leaf-blade", "0% 50%")}>
          <LeafBlade idPrefix={idPrefix} />
          <DewDrop idPrefix={idPrefix} />
        </g>
        <g {...part("veins")}>
          <LeafVeins />
        </g>
        <g {...part("water")}>
          <FlowBeads
            segments={WATER}
            playing={playing}
            reduced={reduced}
            lite={lite}
            r={3.2}
          />
        </g>
      </g>

      {/* where the slab was cut from */}
      <g {...part("cut-line")}>
        <line
          x1={CUT_A.x}
          y1={CUT_A.y}
          x2={CUT_B.x}
          y2={CUT_B.y}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <line
          x1={CUT_A.x}
          y1={CUT_A.y}
          x2={S.x0 + 14}
          y2={S.y0 - 14}
          stroke="#2B2420"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <line
          x1={CUT_B.x}
          y1={CUT_B.y}
          x2={S.x1 + 14}
          y2={S.y0 - 14}
          stroke="#2B2420"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
      </g>

      {/* the cross-section slab */}
      <g {...part("slab")}>
        <path
          d={`M${S.x0} ${S.y0} L${S.x0 + 14} ${S.y0 - 14} H${S.x1 + 14} L${S.x1} ${S.y0} Z`}
          fill={url("slab-top")}
        />
        <path
          d={`M${S.x1} ${S.y0} L${S.x1 + 14} ${S.y0 - 14} V${S.y0 + 136} L${S.x1} ${S.y0 + 150} Z`}
          fill="#2F6A3B"
        />
        <g clipPath={url("slab-clip")}>
          <rect x={S.x0} y={S.y0} width={S.x1 - S.x0} height="150" fill="#F2F7E8" />
          {/* cuticle and upper epidermis */}
          <rect x={S.x0} y={S.y0} width={S.x1 - S.x0} height="5" fill="#E3F0C0" />
          <rect x={S.x0} y={S.y0} width={S.x1 - S.x0} height="1.4" fill="#FFFFFF" />
          {Array.from({ length: 15 }, (_, i) => (
            <rect
              key={`ue${i}`}
              x={S.x0 + i * 24 + 1}
              y={S.y0 + 5}
              width="22"
              height="14"
              rx="4"
              fill="#EEF4DE"
              stroke="#BCD09E"
              strokeWidth="0.8"
            />
          ))}
          {/* palisade cells */}
          {PALISADE.map((x) => (
            <rect
              key={`p${x}`}
              x={x + 1.5}
              y={S.y0 + 21}
              width="17"
              height="54"
              rx="7"
              fill="#D3E6AE"
              stroke="#9DBF6E"
              strokeWidth="0.9"
            />
          ))}
          {/* spongy mesophyll with air spaces */}
          {SPONGY.map((s) => (
            <circle
              key={`s${s.x}-${s.y}`}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#DDEBC0"
              stroke="#A9C686"
              strokeWidth="0.9"
            />
          ))}
          {/* vein bundle: xylem carries water, phloem carries sugar */}
          <circle cx="200" cy="414" r="23" fill="#EAF1D7" stroke="#A9C686" />
          {[
            [190, 404],
            [200, 400],
            [210, 404],
            [194, 413],
            [206, 413],
          ].map(([x, y]) => (
            <circle
              key={`x${x}-${y}`}
              cx={x}
              cy={y}
              r="4.2"
              fill="#C5E1EE"
              stroke="#5E98B6"
              strokeWidth="0.9"
            />
          ))}
          {[
            [192, 424],
            [200, 428],
            [208, 424],
          ].map(([x, y]) => (
            <circle
              key={`ph${x}`}
              cx={x}
              cy={y}
              r="3.6"
              fill="#F3E0B4"
              stroke="#C49A4E"
              strokeWidth="0.9"
            />
          ))}
          {/* lower epidermis */}
          {Array.from({ length: 16 }, (_, i) => {
            const x = S.x0 + i * 22;
            if (STOMATA.some((s) => x + 22 > s - 10 && x < s + 10)) return null;
            return (
              <rect
                key={`le${i}`}
                x={x + 1}
                y="447"
                width="20"
                height="12"
                rx="4"
                fill="#EEF4DE"
                stroke="#BCD09E"
                strokeWidth="0.8"
              />
            );
          })}
          <rect x={S.x0} y="459" width={S.x1 - S.x0} height="3" fill="#E3F0C0" />
        </g>
        <rect
          x={S.x0}
          y={S.y0}
          width={S.x1 - S.x0}
          height="150"
          rx="8"
          fill="none"
          stroke="#7FA65A"
          strokeWidth="1.2"
        />
      </g>

      <g {...part("chloroplasts")}>
        {PALISADE.map((x) =>
          CHLORO_SPOTS.map(([dx, y]) => (
            <ellipse
              key={`c${x}-${y}`}
              cx={x + dx}
              cy={y}
              rx="3"
              ry="4.2"
              fill="#3E8A43"
            />
          )),
        )}
        {SPONGY.filter((_, i) => i % 2 === 0).map((s) => (
          <ellipse
            key={`cs${s.x}-${s.y}`}
            cx={s.x - 3}
            cy={s.y + 2}
            rx="2.6"
            ry="3.4"
            fill="#4C9450"
          />
        ))}
      </g>
      <g {...part("chloro-glow")}>
        {PALISADE.map((x, i) => (
          <g
            key={`g${x}`}
            className="loop"
            style={{
              animation: `glow-pulse 1.6s var(--ease-in-out) ${(i * 0.06).toFixed(2)}s infinite both`,
            }}
          >
            {CHLORO_SPOTS.map(([dx, y]) => (
              <ellipse key={y} cx={x + dx} cy={y} rx="3" ry="4.2" fill="#9BDB6E" />
            ))}
          </g>
        ))}
      </g>

      <g {...part("stomata")}>
        {STOMATA.map((x) => (
          <g key={x}>
            <path
              d={`M${x - 12} 447 Q${x - 13} 459 ${x - 3} 460 Q${x - 1} 453 ${x - 3} 447 Z`}
              fill="#A7CB78"
              stroke="#6E9A45"
              strokeWidth="0.9"
            />
            <path
              d={`M${x + 12} 447 Q${x + 13} 459 ${x + 3} 460 Q${x + 1} 453 ${x + 3} 447 Z`}
              fill="#A7CB78"
              stroke="#6E9A45"
              strokeWidth="0.9"
            />
            <circle cx={x - 7} cy="453" r="1.4" fill="#3E8A43" />
            <circle cx={x + 7} cy="453" r="1.4" fill="#3E8A43" />
          </g>
        ))}
      </g>

      <g {...part("co2")}>
        {STOMATA.flatMap((x, i) => [
          <g
            key={`a${x}`}
            className="loop"
            style={{
              animation: `drift-up 2.8s var(--ease-out) ${i * 0.7}s infinite both`,
            }}
          >
            <CO2 x={x - 4} y={478} />
          </g>,
          <g
            key={`b${x}`}
            className="loop"
            style={{
              animation: `drift-up 2.8s var(--ease-out) ${i * 0.7 + 1.4}s infinite both`,
            }}
          >
            <CO2 x={x + 6} y={484} />
          </g>,
        ])}
      </g>

      <g {...part("oxygen")}>
        {STOMATA.flatMap((x, i) => [
          <g
            key={`o${x}`}
            className="loop"
            style={{
              animation: `drift-down 2.6s var(--ease-out) ${i * 0.5}s infinite both`,
            }}
          >
            <O2 x={x} y={468} />
          </g>,
          <g
            key={`p${x}`}
            className="loop"
            style={{
              animation: `drift-down 2.6s var(--ease-out) ${i * 0.5 + 1.3}s infinite both`,
            }}
          >
            <O2 x={x - 8} y={470} />
          </g>,
        ])}
      </g>

      <g {...part("sugar")}>
        <Hexagon x={90} y={352} />
        <Hexagon x={170} y={364} />
        <Hexagon x={250} y={348} />
        <Hexagon x={330} y={360} />
        <Hexagon x={200} y={433} r={4.4} />
      </g>
    </svg>
  );
}
