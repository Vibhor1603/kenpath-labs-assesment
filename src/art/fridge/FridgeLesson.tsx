"use client";

import { FlowBeads, type FlowSegment } from "@/art/FlowBeads";
import { pipe, shell, VIEW } from "@/art/fridge/geometry";
import { makePart, type PartContext } from "@/art/parts";
import type { LessonArtProps } from "@/content/types";
import { artPalette as c } from "@/lib/tokens";
import { useMemo } from "react";

export const viewBox = VIEW;

export const legend = [
  { color: c.hotGas, label: "Hot gas" },
  { color: c.warmLiquid, label: "Warm liquid" },
  { color: c.veryCold, label: "Very cold" },
  { color: c.coolGas, label: "Cool gas" },
] as const;

/** Steps (0-based) that show the refrigerant colour key. */
export const legendSteps = [1, 2, 3, 4, 5];

const HIDDEN = new Set(["heat-path", "heat-in-arrows", "heat-out", "frost"]);
const CONTEXT_PARTS = new Set(["cabinet", "door", "interior", "pipes"]);

const SEGMENTS: FlowSegment[] = [
  { id: "discharge", d: pipe.discharge, from: c.hotGas, count: 8, ms: 6400 },
  {
    id: "condenser",
    d: pipe.condenser,
    from: c.hotGas,
    to: c.warmLiquid,
    count: 13,
    ms: 11200,
  },
  { id: "liquid", d: pipe.liquid, from: c.warmLiquid, count: 1, ms: 900 },
  {
    id: "capillary",
    d: pipe.capillary,
    from: c.warmLiquid,
    to: c.veryCold,
    count: 4,
    ms: 4600,
  },
  {
    id: "evaporator",
    d: pipe.evaporator,
    from: c.veryCold,
    to: c.coolGas,
    count: 8,
    ms: 5600,
  },
  { id: "suction", d: pipe.suction, from: c.coolGas, count: 6, ms: 4600 },
];

function Tube({
  d,
  base,
  mid,
  hi,
  w,
}: {
  d: string;
  base: string;
  mid: string;
  hi: string;
  w: number;
}) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={base} strokeWidth={w} />
      <path d={d} stroke={mid} strokeWidth={w * 0.62} />
      <path d={d} stroke={hi} strokeWidth={Math.max(0.6, w * 0.2)} opacity={0.85} />
    </g>
  );
}

function Chevron({ x, y, rotate }: { x: number; y: number; rotate: number }) {
  return (
    <path
      d="M-3 -2.5 L0 1 L3 -2.5"
      transform={`translate(${x} ${y}) rotate(${rotate})`}
      fill="none"
      stroke="#2B2420"
      strokeOpacity={0.55}
      strokeWidth={1.3}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function WavyArrow({
  x,
  y,
  segments,
  delay,
}: {
  x: number;
  y: number;
  segments: number;
  delay: number;
}) {
  let d = `M${x} ${y}`;
  for (let i = 0; i < segments; i++) d += i === 0 ? " c12 -7 22 7 34 0" : " s22 7 34 0";
  const end = x + segments * 34;
  return (
    <g
      className="loop"
      style={{ animation: `heat-drift 2.6s var(--ease-in-out) ${delay}s infinite both` }}
    >
      <path d={d} fill="none" stroke={c.heat} strokeWidth={3} strokeLinecap="round" />
      <path
        d={`M${end - 7} ${y - 7} L${end + 2} ${y} L${end - 7} ${y + 7}`}
        fill="none"
        stroke={c.heat}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Squiggle({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <path
      className="loop"
      d={`M${x} ${y} c-4 -5 4 -9 0 -14 s4 -9 0 -14`}
      fill="none"
      stroke={c.heat}
      strokeWidth={2.2}
      strokeLinecap="round"
      style={{ animation: `heat-rise 2.2s var(--ease-out) ${delay}s infinite both` }}
    />
  );
}

export default function FridgeLesson({
  idPrefix,
  stepIndex,
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
      viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
      className="block h-full w-full overflow-visible"
      role="img"
      aria-label="Side cutaway of a fridge showing the refrigerant loop"
    >
      <defs>
        <pattern
          id={id("hatch")}
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="5"
            stroke="#2B2420"
            strokeOpacity="0.26"
            strokeWidth="1"
          />
        </pattern>
        <linearGradient id={id("foam")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3ECDD" />
          <stop offset="1" stopColor="#E6DCC8" />
        </linearGradient>
        <linearGradient id={id("liner")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F9FBFB" />
          <stop offset="0.6" stopColor="#EDF3F4" />
          <stop offset="1" stopColor="#DFE8EA" />
        </linearGradient>
        <linearGradient id={id("liner-depth")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#B9C7CC" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("alu")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EEF1F3" />
          <stop offset="0.55" stopColor="#CBD2D7" />
          <stop offset="1" stopColor="#B2BBC2" />
        </linearGradient>
        <radialGradient id={id("dome")} cx="0.32" cy="0.25" r="0.9">
          <stop offset="0" stopColor="#5C5F64" />
          <stop offset="0.45" stopColor="#2C2E32" />
          <stop offset="1" stopColor="#161719" />
        </radialGradient>
        <linearGradient id={id("brass")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9C6A2C" />
          <stop offset="0.45" stopColor="#E3B474" />
          <stop offset="1" stopColor="#A87436" />
        </linearGradient>
        <linearGradient id={id("chrome")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8C9299" />
          <stop offset="0.45" stopColor="#F5F7F9" />
          <stop offset="1" stopColor="#9EA5AD" />
        </linearGradient>
        <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="0.3" stopColor="#E4EEF1" stopOpacity="0.55" />
          <stop offset="1" stopColor="#CFDDE2" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={id("lemon")} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#FBE38A" />
          <stop offset="1" stopColor="#E1AE2E" />
        </linearGradient>
        <radialGradient id={id("contact")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2B2420" stopOpacity="0.26" />
          <stop offset="1" stopColor="#2B2420" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id("cavity")}>
          <path d={shell.cavity} />
        </clipPath>
      </defs>

      {/* floor */}
      <ellipse cx="214" cy="470" rx="190" ry="9" fill={url("contact")} />
      <rect x="10" y="469" width="380" height="1" fill="#C9C0AE" />

      {/* cabinet in section */}
      <g {...part("cabinet")}>
        <path d={shell.cavity} fill={url("liner")} />
        <path d={shell.cavity} fill={url("liner-depth")} />
        <path
          d={`${shell.outer} ${shell.cavity}`}
          fillRule="evenodd"
          fill={url("foam")}
        />
        <path
          d={`${shell.outer} ${shell.cavity}`}
          fillRule="evenodd"
          fill={url("hatch")}
        />
        <path d={shell.outer} fill="none" stroke="#B9AF9C" strokeWidth="1.1" />
        <path d={shell.cavity} fill="none" stroke="#C8D2D5" strokeWidth="1" />
        <path d={shell.partition} fill={url("foam")} />
        <path d={shell.partition} fill={url("hatch")} />
        <path d={shell.partition} fill="none" stroke="#B9AF9C" strokeWidth="0.8" />
        {/* machine compartment rail and back feet */}
        <rect x="206" y="452" width="94" height="4" fill="#8E8778" />
        <circle cx="286" cy="462" r="7" fill="#3A3633" />
        <circle cx="284" cy="460" r="2" fill="#8C847B" />
        <path d="M80 456 H96 L94 468 H82 Z" fill="#3A3633" />
      </g>

      {/* inside the box */}
      <g {...part("interior")}>
        <g clipPath={url("cavity")}>
          <ellipse cx="112" cy="164" rx="90" ry="70" fill={url("glow")} opacity="0.8" />
          {/* freezer: ice tray and a box */}
          <rect
            x="92"
            y="134"
            width="84"
            height="14"
            rx="2.5"
            fill="#F6FAFB"
            stroke="#B8C6CB"
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect
              key={i}
              x={96 + i * 13}
              y="137"
              width="10"
              height="8"
              rx="1.5"
              fill="#DCEBF0"
            />
          ))}
          <rect
            x="100"
            y="98"
            width="58"
            height="34"
            rx="3"
            fill="#D8E3EA"
            stroke="#AFBFC7"
          />
          <rect x="106" y="106" width="30" height="5" rx="2" fill="#AFC3CE" />
          {/* light */}
          <rect
            x="94"
            y="162"
            width="36"
            height="4"
            rx="2"
            fill="#FFFFFF"
            stroke="#D6DEE0"
            strokeWidth="0.6"
          />
          {/* shelf 1 */}
          <rect
            x="72"
            y="246"
            width="212"
            height="4"
            rx="1"
            fill={url("glass")}
            stroke="#B9C9CE"
            strokeWidth="0.6"
          />
          <rect x="72" y="246" width="212" height="1" fill="#FFFFFF" />
          {/* milk bottle */}
          <path
            d="M108 246 V208 Q108 198 113 194 V186 H123 V194 Q128 198 128 208 V246 Z"
            fill="#F4F7F8"
            stroke="#B6C3C8"
            strokeWidth="0.9"
          />
          <path d="M109 246 V214 H127 V246 Z" fill="#FFFFFF" />
          <rect x="112.5" y="181" width="11" height="6" rx="1.5" fill="#3E6E9E" />
          <path
            d="M111 212 V240"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* jar */}
          <rect
            x="146"
            y="216"
            width="30"
            height="30"
            rx="5"
            fill="#B5443A"
            stroke="#8F3029"
            strokeWidth="0.8"
          />
          <rect x="144" y="209" width="34" height="8" rx="2" fill={url("brass")} />
          <rect
            x="150"
            y="224"
            width="22"
            height="12"
            rx="2"
            fill="#F4E8D2"
            opacity="0.9"
          />
          <path
            d="M150 220 V242"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.45"
          />
          {/* shelf 2 */}
          <rect
            x="72"
            y="326"
            width="212"
            height="4"
            rx="1"
            fill={url("glass")}
            stroke="#B9C9CE"
            strokeWidth="0.6"
          />
          <rect x="72" y="326" width="212" height="1" fill="#FFFFFF" />
          {/* lemons */}
          <ellipse cx="121" cy="315" rx="14" ry="11" fill={url("lemon")} />
          <ellipse cx="146" cy="317" rx="12" ry="9" fill={url("lemon")} />
          <ellipse cx="116" cy="310" rx="4" ry="2.4" fill="#FFF7D0" opacity="0.8" />
          <path
            d="M134 314 l3 -2"
            stroke="#B3871F"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          {/* crisper drawer with cucumber and tomato */}
          <path
            d="M80 368 H186 V440 H80 Z"
            fill="#EAF2F4"
            opacity="0.75"
            stroke="#BCCBD0"
          />
          <ellipse cx="120" cy="420" rx="28" ry="9" fill="#4F8A4C" />
          <ellipse
            cx="146"
            cy="420"
            rx="8"
            ry="9"
            fill="#E9F1D9"
            stroke="#4F8A4C"
            strokeWidth="1.4"
          />
          <circle cx="164" cy="424" r="10" fill="#D3473A" />
          <circle cx="160" cy="420" r="2.4" fill="#F7A99F" />
          <path d="M80 368 H186" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>
      </g>

      {/* evaporator plate in the freezer */}
      <g {...part("evaporator")}>
        <rect
          x="218"
          y="62"
          width="66"
          height="86"
          rx="3"
          fill={url("alu")}
          stroke="#9AA4AC"
          strokeWidth="0.8"
        />
        <Tube d={pipe.evaporator} base="#9FA9B1" mid="#D7DEE3" hi="#FFFFFF" w={5} />
      </g>
      <g {...part("frost")}>
        {[
          [232, 66],
          [254, 80],
          [268, 94],
          [236, 108],
          [262, 122],
          [244, 136],
          [226, 92],
          [274, 140],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={1.4}
            fill="#FFFFFF"
            className="loop"
            style={{ animation: `twinkle 1.8s var(--ease-in-out) ${i * 0.22}s infinite` }}
          />
        ))}
      </g>

      {/* compressor in the machine compartment */}
      <g {...part("compressor", "50% 100%")}>
        <g
          key={`hum-${stepIndex}`}
          className="loop"
          style={
            stepIndex === 2 && !reduced
              ? { animation: "hum 110ms linear 700ms 4" }
              : undefined
          }
        >
          <rect x="216" y="446" width="66" height="6" rx="2" fill="#4A4642" />
          <rect x="222" y="450" width="10" height="4" rx="1" fill="#2B2724" />
          <rect x="266" y="450" width="10" height="4" rx="1" fill="#2B2724" />
          <path
            d="M222 448 V420 Q222 398 248 398 Q274 398 274 420 V448 Z"
            fill={url("dome")}
          />
          <path
            d="M230 418 Q232 404 246 402"
            fill="none"
            stroke="#9A9DA2"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path d="M222 430 H274" stroke="#0E0F10" strokeWidth="1" opacity="0.6" />
          <rect x="212" y="418" width="11" height="16" rx="2" fill="#3B3D41" />
          <rect x="246" y="392" width="4" height="7" rx="1" fill="#B8733A" />
        </g>
      </g>

      {/* condenser coils on the back */}
      <g {...part("condenser")}>
        <rect x="300" y="60" width="26" height="3" fill="#6E6A64" />
        <rect x="300" y="300" width="26" height="3" fill="#6E6A64" />
        <Tube d={pipe.condenser} base="#1F2023" mid="#3B3D41" hi="#7C8086" w={4.2} />
        {[331, 337, 343, 349, 355].map((x) => (
          <line
            key={x}
            x1={x}
            y1="58"
            x2={x}
            y2="314"
            stroke="#2A2B2E"
            strokeWidth="0.8"
          />
        ))}
      </g>

      {/* connecting pipes */}
      <g {...part("pipes")}>
        <Tube d={pipe.discharge} base="#9C5A28" mid="#D08A4E" hi="#F6C99A" w={5} />
        <Tube d={pipe.liquid} base="#9C5A28" mid="#D08A4E" hi="#F6C99A" w={4} />
        <Tube d={pipe.suction} base="#9C5A28" mid="#D08A4E" hi="#F6C99A" w={5.5} />
        <Chevron x={370} y={262} rotate={180} />
        <Chevron x={308} y={292} rotate={0} />
        <Chevron x={326} y={346} rotate={0} />
      </g>

      {/* filter drier and capillary tube */}
      <g {...part("expansion-valve")}>
        <Tube d={pipe.capillary} base="#9C5A28" mid="#D99A60" hi="#F8D3AA" w={2} />
        <rect
          x="320"
          y="328"
          width="12"
          height="32"
          rx="5"
          fill={url("brass")}
          stroke="#8A5A22"
          strokeWidth="0.8"
        />
        <Chevron x={314} y={230} rotate={180} />
      </g>

      <g {...part("refrigerant")}>
        <FlowBeads segments={SEGMENTS} playing={playing} reduced={reduced} lite={lite} />
      </g>

      {/* heat leaving the room-facing coils */}
      <g {...part("heat-out")}>
        {[
          [384, 110, 0],
          [390, 170, 0.5],
          [384, 230, 1],
          [390, 290, 1.5],
          [338, 50, 0.3],
          [352, 50, 1.1],
        ].map(([x, y, d], i) => (
          <Squiggle key={i} x={x} y={y} delay={d} />
        ))}
      </g>

      {/* heat taken out of the food (step 1) */}
      <g {...part("heat-path")}>
        <WavyArrow x={148} y={226} segments={6} delay={0} />
        <WavyArrow x={164} y={300} segments={5} delay={0.9} />
      </g>

      {/* heat soaked up by the cold pipes (step 6) */}
      <g {...part("heat-in-arrows")}>
        {[
          "M118 240 C120 214 176 186 204 168 C216 160 226 150 236 140",
          "M160 238 C170 214 194 190 207 172 C216 160 228 152 240 148",
        ].map((d, i) => (
          <g
            key={d}
            className="loop"
            style={{
              animation: `glow-pulse 2.4s var(--ease-in-out) ${i * 0.6}s infinite both`,
            }}
          >
            <path
              d={d}
              fill="none"
              stroke={c.heat}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1 7"
            />
          </g>
        ))}
        <path
          d="M228 134 L238 140 L230 148"
          fill="none"
          stroke={c.heat}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* door in section, with bins, gasket and handle */}
      <g {...part("door")}>
        <rect x="44" y="42" width="26" height="412" rx="5" fill={url("foam")} />
        <rect x="44" y="42" width="26" height="412" rx="5" fill={url("hatch")} />
        <rect
          x="44"
          y="42"
          width="26"
          height="412"
          rx="5"
          fill="none"
          stroke="#B9AF9C"
          strokeWidth="1.1"
        />
        <rect x="44" y="44" width="3" height="408" rx="1.5" fill="#FBF8F2" />
        <rect x="68" y="46" width="7" height="12" rx="2" fill="#4A433D" />
        <rect x="68" y="438" width="7" height="12" rx="2" fill="#4A433D" />
        <path
          d="M69 49 H74 M69 52 H74 M69 55 H74 M69 441 H74 M69 444 H74 M69 447 H74"
          stroke="#7A716A"
          strokeWidth="0.6"
        />
        {/* bins */}
        <rect x="76" y="186" width="8" height="58" rx="3" fill="#2F6A4A" />
        <rect x="77" y="178" width="6" height="10" rx="1.5" fill="#E2C46A" />
        <path d="M70 226 H96 V246 H70" fill="#EAF2F4" opacity="0.8" stroke="#BCCBD0" />
        <rect x="74" y="320" width="18" height="12" rx="2" fill="#F2D27A" />
        <path d="M70 318 H96 V336 H70" fill="#EAF2F4" opacity="0.75" stroke="#BCCBD0" />
        {/* handle */}
        <rect x="31" y="136" width="14" height="6" rx="2" fill="#8E949B" />
        <rect x="31" y="244" width="14" height="6" rx="2" fill="#8E949B" />
        <rect x="25" y="130" width="7" height="126" rx="3.5" fill={url("chrome")} />
        <rect x="27.5" y="136" width="1.2" height="112" fill="#FFFFFF" opacity="0.9" />
      </g>
    </svg>
  );
}
