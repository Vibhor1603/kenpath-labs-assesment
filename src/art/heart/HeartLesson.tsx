"use client";

import { FlowBeads, type FlowSegment } from "@/art/FlowBeads";
import {
  BodyVessels,
  HeartDefs,
  HeartExterior,
  LungVessels,
  OUTER,
  PulmonaryTrunk,
  vessel,
} from "@/art/heart/shape";
import { makePart, type PartContext } from "@/art/parts";
import { copy } from "@/content/copy";
import type { LessonArtProps } from "@/content/types";
import { artPalette as c } from "@/lib/tokens";
import type { CSSProperties } from "react";
import { useMemo } from "react";

export const viewBox = { w: 400, h: 500 } as const;

export const legend = [
  { color: c.bloodRich, label: "Rich in oxygen" },
  { color: c.bloodPoor, label: "Low in oxygen" },
] as const;

export const legendSteps = [3];

export const notes: Record<number, string> = { 3: copy.heart.loopColorNote };

/** One beat, 72 beats a minute. Valves and squeeze share this clock. */
const BEAT = "833ms";

const HIDDEN = new Set([
  "chest-outline",
  "lungs-outline",
  "body-outline",
  "flow-lungs",
  "flow-body",
  "chamber-cue",
]);
const CONTEXT_PARTS = new Set([
  "atrium-right",
  "atrium-left",
  "ventricle-right",
  "ventricle-left",
  "septum",
  "loop-lungs",
  "loop-body",
]);

const cavity = {
  ra: "M118 210 C102 230 102 272 120 294 C134 304 156 304 164 290 L164 218 C156 204 134 200 118 210 Z",
  la: "M238 214 L238 290 C250 304 282 304 298 288 C312 262 308 226 290 210 C272 198 252 200 238 214 Z",
  rv: "M114 318 C124 356 160 394 204 414 L204 318 C172 306 140 306 114 318 Z",
  lv: "M222 318 L222 414 C246 420 266 404 280 374 C292 348 292 330 288 318 C266 306 242 306 222 318 Z",
  raRv: "M124 292 H162 V318 H124 Z",
  laLv: "M244 292 H288 V316 H244 Z",
  pulmonaryOut: "M172 320 L196 314 L194 232 L174 232 Z",
  aorticOut: "M200 232 C202 266 212 296 220 320 L240 318 C234 292 228 262 226 232 Z",
} as const;

const LUNG_BED =
  "M152 98 C120 96 104 70 116 46 C130 24 170 26 186 44 C194 54 206 54 214 44 C230 26 270 24 284 46 C296 70 280 96 262 96";
const BODY_BED = "M338 470 C338 490 322 494 300 494 H148 C126 494 110 490 110 470";

const LUNG_FLOW: FlowSegment[] = [
  {
    id: "ra-rv",
    d: "M138 236 C140 270 142 300 146 350",
    from: c.bloodPoor,
    count: 2,
    ms: 1500,
  },
  {
    id: "rv-out",
    d: "M162 386 C176 376 184 356 184 330 V158 C184 128 172 110 152 98",
    from: c.bloodPoor,
    count: 6,
    ms: 4400,
  },
  { id: "lungs", d: LUNG_BED, from: c.bloodPoor, to: c.bloodRich, count: 6, ms: 4400 },
  { id: "pv", d: vessel.pulmonaryVein, from: c.bloodRich, count: 2, ms: 1600 },
];

const BODY_FLOW: FlowSegment[] = [
  {
    id: "la-lv",
    d: "M270 236 C270 276 266 312 258 352",
    from: c.bloodRich,
    count: 2,
    ms: 1600,
  },
  {
    id: "lv-out",
    d: "M250 390 C236 376 228 352 226 330 C222 300 214 270 213 240 V152 C213 102 338 102 338 152 V470",
    from: c.bloodRich,
    count: 12,
    ms: 9300,
  },
  { id: "body", d: BODY_BED, from: c.bloodRich, to: c.bloodPoor, count: 5, ms: 3900 },
  { id: "ivc", d: vessel.ivc, from: c.bloodPoor, count: 3, ms: 2400 },
  { id: "svc", d: vessel.svc, from: c.bloodPoor, count: 2, ms: 1500 },
];

/** A leaflet hinged at (x, y). `dir` is the side it points to when shut. */
function Leaflet({
  x,
  y,
  tipX,
  tipY,
  anim,
  origin,
  reduced,
}: {
  x: number;
  y: number;
  tipX: number;
  tipY: number;
  anim: string;
  origin: string;
  reduced: boolean;
}) {
  const mx = (x + tipX) / 2 + (tipY - y) * 0.18;
  const my = (y + tipY) / 2 - (tipX - x) * 0.18;
  const style: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: origin,
    animation: reduced ? undefined : `${anim} ${BEAT} var(--ease-in-out) infinite both`,
  };
  return (
    <path
      className="loop"
      style={style}
      d={`M${x} ${y} Q${mx.toFixed(1)} ${my.toFixed(1)} ${tipX} ${tipY}`}
      fill="none"
      stroke="#FFF4EC"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
  );
}

function ValveRing({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return (
    <g fill="#F2DC9E" stroke="#B38A3E" strokeWidth="0.8">
      <circle cx={x1} cy={y} r="3.2" />
      <circle cx={x2} cy={y} r="3.2" />
    </g>
  );
}

export default function HeartLesson({
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
  const url = (s: string) => `url(#${idPrefix}-${s})`;
  const beat: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "50% 45%",
    animation: reduced ? undefined : `beat ${BEAT} var(--ease-out) infinite both`,
  };
  const cue = (delay: number): CSSProperties => ({
    animation: reduced
      ? undefined
      : `chamber-cue 2.4s var(--ease-in-out) ${delay}s infinite both`,
    opacity: reduced ? 0.6 : undefined,
  });

  return (
    <svg
      viewBox="0 0 400 500"
      className="block h-full w-full overflow-visible"
      role="img"
      aria-label="A heart cut open to show its four rooms, valves and the two blood loops"
    >
      <defs>
        <HeartDefs idPrefix={idPrefix} />
        <radialGradient id={`${idPrefix}-cut`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#C85868" />
          <stop offset="1" stopColor="#9E3443" />
        </radialGradient>
        <pattern
          id={`${idPrefix}-alveoli`}
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx="4.5"
            cy="4.5"
            r="2.6"
            fill="none"
            stroke="#D99AA4"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>

      {/* faint chest outline for scale, line only */}
      <g {...part("chest-outline")}>
        <path
          d="M148 16 C150 44 124 60 76 70 C44 76 28 104 26 146 L22 496 M252 16 C250 44 276 60 324 70 C356 76 372 104 374 146 L378 496"
          fill="none"
          stroke="#B9AFA2"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M200 92 V250"
          fill="none"
          stroke="#B9AFA2"
          strokeWidth="1.2"
          strokeDasharray="2 5"
          strokeLinecap="round"
        />
      </g>

      {/* lung loop destination */}
      <g {...part("lungs-outline")}>
        <path
          d="M200 4 V36 Q196 44 180 50 M200 36 Q204 44 220 50"
          fill="none"
          stroke="#C9A3A9"
          strokeWidth="5"
          strokeLinecap="round"
        />
        {[
          "M160 100 C128 106 100 92 98 64 C96 38 116 22 142 24 C166 26 178 46 178 70 C178 88 172 98 160 100 Z",
          "M240 100 C272 106 300 92 302 64 C304 38 284 22 258 24 C234 26 222 46 222 70 C222 88 228 98 240 100 Z",
        ].map((d) => (
          <g key={d}>
            <path d={d} fill="#F6DFE1" />
            <path d={d} fill={url("alveoli")} opacity="0.7" />
            <path d={d} fill="none" stroke="#C98E98" strokeWidth="1.2" />
          </g>
        ))}
      </g>

      {/* body loop destination: a bed of tiny vessels */}
      <g {...part("body-outline")}>
        <rect
          x="96"
          y="462"
          width="256"
          height="38"
          rx="14"
          fill="#F3E7E0"
          stroke="#D7C2B6"
        />
        <path
          d="M118 481 q8 -8 16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0 t16 0"
          fill="none"
          stroke="#D9B3B0"
          strokeWidth="1.2"
        />
      </g>

      <g {...part("loop-lungs")}>
        <LungVessels />
      </g>
      <g {...part("loop-body")}>
        <BodyVessels />
      </g>
      <g {...part("loop-lungs")}>
        <PulmonaryTrunk />
      </g>

      <g className="loop" style={beat}>
        {/* cut surface of the heart wall */}
        <path d={OUTER} fill={url("cut")} />
        <path d={OUTER} fill="none" stroke="#7A2634" strokeWidth="1.2" />
        <g {...part("septum")}>
          <path d="M204 318 L222 318 L222 416 L204 414 Z" fill="#8E2C3B" />
        </g>

        <g {...part("atrium-right")}>
          <path d={cavity.ra} fill="#D8CBE8" />
          <path d={cavity.raRv} fill="#D8CBE8" />
        </g>
        <g {...part("ventricle-right")}>
          <path d={cavity.rv} fill="#CFC0E3" />
          <path d={cavity.pulmonaryOut} fill="#CFC0E3" />
        </g>
        <g {...part("atrium-left")}>
          <path d={cavity.la} fill="#F3CBC6" />
          <path d={cavity.laLv} fill="#F3CBC6" />
        </g>
        <g {...part("ventricle-left")}>
          <path d={cavity.lv} fill="#EDBDB7" />
          <path d={cavity.aorticOut} fill="#EDBDB7" />
        </g>

        <g {...part("chamber-cue")}>
          <g className="loop" style={cue(0)}>
            <path
              d={cavity.ra}
              fill="#FFFFFF"
              fillOpacity="0.32"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <path
              d={cavity.la}
              fill="#FFFFFF"
              fillOpacity="0.32"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </g>
          <g className="loop" style={cue(1.2)}>
            <path
              d={cavity.rv}
              fill="#FFFFFF"
              fillOpacity="0.32"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <path
              d={cavity.lv}
              fill="#FFFFFF"
              fillOpacity="0.32"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
          </g>
        </g>

        <g {...part("valve-tricuspid")}>
          <ValveRing x1={124} x2={162} y={306} />
          <Leaflet
            x={124}
            y={306}
            tipX={141}
            tipY={324}
            anim="valve-in-l"
            origin="0% 0%"
            reduced={reduced}
          />
          <Leaflet
            x={162}
            y={306}
            tipX={145}
            tipY={324}
            anim="valve-in-r"
            origin="100% 0%"
            reduced={reduced}
          />
        </g>
        <g {...part("valve-mitral")}>
          <ValveRing x1={244} x2={288} y={304} />
          <Leaflet
            x={244}
            y={304}
            tipX={264}
            tipY={322}
            anim="valve-in-l"
            origin="0% 0%"
            reduced={reduced}
          />
          <Leaflet
            x={288}
            y={304}
            tipX={268}
            tipY={322}
            anim="valve-in-r"
            origin="100% 0%"
            reduced={reduced}
          />
        </g>
        <g {...part("valve-pulmonary")}>
          <ValveRing x1={174} x2={194} y={240} />
          <Leaflet
            x={174}
            y={240}
            tipX={183}
            tipY={229}
            anim="valve-out-l"
            origin="0% 100%"
            reduced={reduced}
          />
          <Leaflet
            x={194}
            y={240}
            tipX={185}
            tipY={229}
            anim="valve-out-r"
            origin="100% 100%"
            reduced={reduced}
          />
        </g>
        <g {...part("valve-aortic")}>
          <ValveRing x1={201} x2={226} y={240} />
          <Leaflet
            x={201}
            y={240}
            tipX={212}
            tipY={229}
            anim="valve-out-l"
            origin="0% 100%"
            reduced={reduced}
          />
          <Leaflet
            x={226}
            y={240}
            tipX={215}
            tipY={229}
            anim="valve-out-r"
            origin="100% 100%"
            reduced={reduced}
          />
        </g>

        <g {...part("wall-front")}>
          <HeartExterior idPrefix={idPrefix} />
        </g>
      </g>

      <g {...part("flow-lungs")}>
        <FlowBeads
          segments={LUNG_FLOW}
          playing={playing}
          reduced={reduced}
          lite={lite}
          r={4.2}
        />
      </g>
      <g {...part("flow-body")}>
        <FlowBeads
          segments={BODY_FLOW}
          playing={playing}
          reduced={reduced}
          lite={lite}
          r={4.2}
        />
      </g>
    </svg>
  );
}
