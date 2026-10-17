/**
 * Heart in a 400 x 500 viewBox, front view. Viewer's left is the body's right
 * side (right atrium and ventricle). Vessels follow the common teaching layout:
 * vena cava on the far left, pulmonary trunk from the right ventricle, aorta
 * from the left ventricle arching over to the right.
 */

export const OUTER =
  "M150 178 C112 182 94 216 96 258 C98 300 116 342 152 380 C182 412 210 434 234 442 C258 440 282 414 300 380 C320 340 324 292 314 250 C306 214 286 188 256 178 C222 166 184 168 150 178 Z";

export const vessel = {
  svc: "M126 118 V226",
  ivc: "M110 470 C112 404 118 344 128 298",
  pulmonaryTrunk: "M184 306 V158 C184 128 172 110 152 98",
  pulmonaryRight: "M184 156 C192 128 214 110 244 100",
  aorta: "M213 306 V152 C213 102 338 102 338 152 V470",
  pulmonaryVein: "M262 96 C268 124 272 166 272 212",
  pulmonaryVein2: "M290 94 C300 132 298 180 290 214",
  branches: ["M246 114 V72", "M272 108 V66", "M298 110 V72"],
} as const;

type Props = { idPrefix: string };

export function HeartDefs({ idPrefix }: Props) {
  const id = (s: string) => `${idPrefix}-${s}`;
  return (
    <>
      <radialGradient id={id("muscle")} cx="0.34" cy="0.3" r="0.85">
        <stop offset="0" stopColor="#D35E70" />
        <stop offset="0.55" stopColor="#B4404F" />
        <stop offset="1" stopColor="#7E2A38" />
      </radialGradient>
      <linearGradient id={id("vessel-red")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E16A62" />
        <stop offset="1" stopColor="#A9343A" />
      </linearGradient>
      <linearGradient id={id("gloss")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={id("contact")} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#2B2420" stopOpacity="0.22" />
        <stop offset="1" stopColor="#2B2420" stopOpacity="0" />
      </radialGradient>
      <clipPath id={id("outer")}>
        <path d={OUTER} />
      </clipPath>
    </>
  );
}

function Tube({
  d,
  color,
  w,
  shade,
}: {
  d: string;
  color: string;
  w: number;
  shade: string;
}) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={shade} strokeWidth={w} />
      <path d={d} stroke={color} strokeWidth={w * 0.72} />
      <path
        d={d}
        stroke="#FFFFFF"
        strokeOpacity="0.28"
        strokeWidth={w * 0.16}
        transform={`translate(${-w * 0.18} 0)`}
      />
    </g>
  );
}

const POOR = { color: "#8F7CB0", shade: "#6A5888" };
const RICH = { color: "#D2504E", shade: "#9A2F34" };

/** Vessels of the lung loop: pulmonary trunk out, pulmonary veins back. */
export function LungVessels() {
  return (
    <g>
      <Tube d={vessel.pulmonaryVein} {...RICH} w={13} />
      <Tube d={vessel.pulmonaryVein2} {...RICH} w={11} />
      <Tube d={vessel.pulmonaryRight} {...POOR} w={16} />
    </g>
  );
}

export function PulmonaryTrunk() {
  return <Tube d={vessel.pulmonaryTrunk} {...POOR} w={24} />;
}

/** Vessels of the body loop: aorta out, the two venae cavae back. */
export function BodyVessels() {
  return (
    <g>
      <Tube d={vessel.ivc} {...POOR} w={24} />
      <Tube d={vessel.svc} {...POOR} w={26} />
      <Tube d={vessel.aorta} {...RICH} w={26} />
    </g>
  );
}

/** Short vessel stumps for the exhibit view, like a museum model. */
export function VesselStumps() {
  return (
    <g>
      <Tube d="M126 112 V226" {...POOR} w={26} />
      <Tube d="M262 132 C268 150 272 180 272 212" {...RICH} w={13} />
      <Tube d="M184 156 C192 136 204 126 222 118" {...POOR} w={16} />
      {vessel.branches.map((d) => (
        <Tube key={d} d={d} {...RICH} w={10} />
      ))}
      <Tube d="M213 306 V152 C213 102 338 102 338 152 V196" {...RICH} w={26} />
      <Tube d="M184 306 V158 C184 136 176 124 164 116" {...POOR} w={24} />
    </g>
  );
}

/** Outside of the heart: muscle, fat in the grooves, coronary vessels, gloss. */
export function HeartExterior({ idPrefix }: Props) {
  const url = (s: string) => `url(#${idPrefix}-${s})`;
  return (
    <g>
      <path d={OUTER} fill={url("muscle")} />
      <g clipPath={url("outer")}>
        {/* right and left auricles */}
        <path
          d="M96 236 C110 214 140 204 160 214 C150 232 124 244 96 252 Z"
          fill="#C24A5B"
        />
        <path
          d="M318 236 C304 214 282 206 266 214 C276 230 296 240 318 248 Z"
          fill="#A83A4B"
        />
        {/* fibre lines */}
        {[
          "M120 300 C160 330 200 360 236 430",
          "M140 280 C180 310 220 350 252 420",
          "M170 268 C210 300 250 340 276 396",
          "M206 262 C244 290 280 320 298 364",
          "M110 330 C140 360 180 396 214 432",
          "M236 262 C270 284 300 306 312 330",
          "M130 230 C170 236 220 238 280 228",
        ].map((d) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.09"
            strokeWidth="1.4"
          />
        ))}
        {/* coronary groove and front groove with fat */}
        <path
          d="M92 288 C130 300 170 304 204 300 C240 296 290 288 322 278 L322 290 C290 302 240 310 204 312 C170 316 130 312 92 300 Z"
          fill="#EBCB86"
          opacity="0.5"
        />
        <path
          d="M206 304 C206 344 214 392 236 442 L228 444 C204 394 196 346 197 304 Z"
          fill="#EBCB86"
          opacity="0.42"
        />
        {/* coronary arteries (red) and cardiac veins (plum) */}
        <path
          d="M201 306 C203 344 212 390 232 438"
          fill="none"
          stroke="#E0574F"
          strokeWidth="2.2"
        />
        <path
          d="M206 330 C224 344 240 352 262 356 M212 370 C226 380 240 386 256 390 M204 350 C188 360 172 364 154 362"
          fill="none"
          stroke="#E0574F"
          strokeWidth="1.8"
        />
        <path
          d="M96 296 C130 306 170 308 204 306 C240 302 290 294 320 284"
          fill="none"
          stroke="#E0574F"
          strokeWidth="1.8"
          opacity="0.85"
        />
        <path
          d="M196 304 C192 344 200 392 220 438"
          fill="none"
          stroke="#7E6A9A"
          strokeWidth="1.8"
          opacity="0.8"
        />
        {/* broad soft highlight on the lit side, one sharp gloss streak */}
        <ellipse
          cx="160"
          cy="250"
          rx="58"
          ry="40"
          fill={url("gloss")}
          opacity="0.3"
          transform="rotate(-24 160 250)"
        />
        <path
          d="M128 236 C140 220 160 212 182 212"
          fill="none"
          stroke="#FFFFFF"
          strokeOpacity="0.75"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* core shadow on the far side */}
        <path
          d="M314 250 C324 300 312 360 280 410 C300 360 306 300 294 250 Z"
          fill="#5E1E2A"
          opacity="0.35"
        />
      </g>
      <path d={OUTER} fill="none" stroke="#7A2634" strokeWidth="1.2" />
    </g>
  );
}
