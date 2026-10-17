"use client";

import { PartGroup } from "@/components/stage/PartGroup";
import type { ArtComponentProps, PartPose } from "@/content/types";

type Props = ArtComponentProps & {
  stepPose?: Record<string, PartPose>;
  focusedParts?: string[];
};

/** Semi-realistic leaf art. viewBox: 0 0 320 480 */
export default function LeafArt({
  idPrefix = "l",
  variant = "full",
  stepPose = {},
}: Props) {
  const p = (id: string) => stepPose[id];
  const id = (n: string) => `${idPrefix}-${n}`;

  if (variant === "trophy") {
    return (
      <svg viewBox="0 0 80 110" width="80" height="110" aria-hidden="true">
        <defs>
          <linearGradient id={id("tlg")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#C9DDB8" />
            <stop offset="100%" stopColor="#3E7D4A" />
          </linearGradient>
        </defs>
        <path d="M40 10 C20 10 8 30 12 55 C16 75 30 88 40 90 C50 88 64 75 68 55 C72 30 60 10 40 10Z"
          fill={`url(#${id("tlg")})`} />
        <line x1="40" y1="90" x2="40" y2="108" stroke="#5E8E62" strokeWidth="3" strokeLinecap="round" />
        <path d="M40 50 C32 44 28 38 32 34 C36 30 40 36 40 40" fill="#2F6A3B" opacity="0.7" />
        <path d="M40 44 C48 38 52 32 48 28 C44 24 40 30 40 34" fill="#3E7D4A" opacity="0.6" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 480" width="100%" height="100%"
      role="img" aria-label="Leaf diagram">
      <title>Leaf</title>
      <defs>
        <linearGradient id={id("bladeg")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3E7D4A" />
          <stop offset="60%" stopColor="#4A9456" />
          <stop offset="100%" stopColor="#C9DDB8" />
        </linearGradient>
        <linearGradient id={id("veing")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5EA868" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#7DC888" stopOpacity="0.5" />
        </linearGradient>
        <radialGradient id={id("dewg")} cx="35%" cy="35%">
          <stop offset="0%" stopColor="#EFF6FA" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#CFE4EC" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#CFE4EC" stopOpacity="0.3" />
        </radialGradient>
        <linearGradient id={id("slabg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2F6A3B" />
          <stop offset="40%" stopColor="#4A9456" />
          <stop offset="100%" stopColor="#C9DDB8" />
        </linearGradient>
        <clipPath id={id("bladeclip")}>
          <path d="M160 60 C110 60 72 100 72 160 C72 230 110 310 160 340 C210 310 248 230 248 160 C248 100 210 60 160 60Z" />
        </clipPath>
      </defs>

      {/* ── SUN RAYS ── */}
      <PartGroup id="sun-rays" pose={p("sun-rays")} style={{ opacity: 0 }}>
        {[0, 20, 40, 60, -20].map((angle, i) => (
          <line key={i}
            x1={60} y1={60}
            x2={60 + Math.cos((angle - 45) * Math.PI / 180) * 60}
            y2={60 + Math.sin((angle - 45) * Math.PI / 180) * 60}
            stroke="#F7E3A1" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.8"
          />
        ))}
        <circle cx="60" cy="60" r="18" fill="#F7E3A1" fillOpacity="0.7" />
        <circle cx="60" cy="60" r="12" fill="#FFF3E0" fillOpacity="0.6" />
      </PartGroup>

      {/* ── TWIG ── */}
      <PartGroup id="twig" pose={p("twig")}>
        <path d="M160 340 L160 430 C160 440 155 450 150 455"
          stroke="#8B6914" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M160 340 L160 430 C160 440 155 450 150 455"
          stroke="#A0820A" strokeWidth="3" strokeLinecap="round" fill="none" strokeOpacity="0.4" />
      </PartGroup>

      {/* ── LEAF BLADE (main body) ── */}
      <PartGroup id="leaf-blade" pose={p("leaf-blade")} transformOrigin="center bottom">
        <path
          d="M160 60 C110 60 72 100 72 160 C72 230 110 310 160 340 C210 310 248 230 248 160 C248 100 210 60 160 60Z"
          fill={`url(#${id("bladeg")})`}
        />
        {/* Waxy cuticle sheen */}
        <path
          d="M160 65 C125 65 95 100 90 155 C118 100 160 75 220 90"
          fill="none" stroke="#C9DDB8" strokeWidth="6" strokeLinecap="round" strokeOpacity="0.45" />
        {/* Tiny nibbled notch at edge */}
        <path d="M72 165 C68 160 70 154 72 148" fill="none"
          stroke="#2F6A3B" strokeWidth="1.5" strokeLinecap="round" />
        {/* Edge stroke */}
        <path
          d="M160 60 C110 60 72 100 72 160 C72 230 110 310 160 340 C210 310 248 230 248 160 C248 100 210 60 160 60Z"
          fill="none" stroke="#2F6A3B" strokeWidth="1.5" />
      </PartGroup>

      {/* ── VEINS ── */}
      <PartGroup id="veins" pose={p("veins")} style={{ opacity: 0.8 }}>
        {/* Midrib */}
        <path d="M160 340 L160 65" stroke={`url(#${id("veing")})`} strokeWidth="3" strokeLinecap="round" />
        {/* Secondary veins */}
        {[100, 130, 160, 190, 220, 250, 280].map((y, i) => (
          <g key={i}>
            <path d={`M160 ${y} C140 ${y - 5} 118 ${y + 10} 98 ${y + 20}`}
              stroke="#7DC888" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
            <path d={`M160 ${y} C180 ${y - 5} 202 ${y + 10} 222 ${y + 20}`}
              stroke="#7DC888" strokeWidth="1.5" strokeLinecap="round" fill="none" strokeOpacity="0.7" />
          </g>
        ))}
      </PartGroup>

      {/* ── DEW DROP ── */}
      <PartGroup id="dew-drop" pose={p("dew-drop")}>
        <ellipse cx="230" cy="130" rx="8" ry="10"
          fill={`url(#${id("dewg")})`} />
        <ellipse cx="227" cy="125" rx="3" ry="2"
          fill="#FBF5EC" fillOpacity="0.8" />
      </PartGroup>

      {/* ── CUT LINE (cross-section reveal) ── */}
      <PartGroup id="cut-line" pose={p("cut-line")} style={{ opacity: 0 }}>
        <line x1="72" y1="220" x2="248" y2="220"
          stroke="#2F6A3B" strokeWidth="1.5" strokeDasharray="6 4" />
      </PartGroup>

      {/* ── SLAB (cross-section) ── */}
      <PartGroup id="slab" pose={p("slab")} style={{ opacity: 0 }}>
        <rect x="80" y="220" width="160" height="100" rx="4"
          fill={`url(#${id("slabg")})`} fillOpacity="0.9" />
        {/* Cuticle layer */}
        <rect x="80" y="220" width="160" height="6" rx="2" fill="#C9DDB8" />
        {/* Upper epidermis */}
        <rect x="80" y="226" width="160" height="8" fill="#4A9456" fillOpacity="0.7" />
        {/* Palisade cells (columnar) */}
        {[86, 96, 106, 116, 126, 136, 146, 156, 166, 176, 186, 196, 206, 216, 224].map((x) => (
          <rect key={x} x={x} y={234} width="6" height="26" rx="2"
            fill="#3E7D4A" fillOpacity="0.75" />
        ))}
        {/* Spongy mesophyll — air spaces */}
        <rect x="80" y="262" width="160" height="28" fill="#5EA868" fillOpacity="0.5" />
        {[95, 120, 145, 170, 205].map((x) => (
          <ellipse key={x} cx={x} cy={276} rx={9} ry={7}
            fill="#C9DDB8" fillOpacity="0.4" />
        ))}
        {/* Lower epidermis */}
        <rect x="80" y="292" width="160" height="6" fill="#4A9456" fillOpacity="0.6" />
        {/* Lower cuticle */}
        <rect x="80" y="298" width="160" height="4" rx="2" fill="#C9DDB8" fillOpacity="0.7" />
        {/* Vein bundle */}
        <rect x="152" y="228" width="16" height="68" rx="3" fill="#8B6914" fillOpacity="0.5" />
      </PartGroup>

      {/* ── CHLOROPLASTS ── */}
      <PartGroup id="chloroplasts" pose={p("chloroplasts")} style={{ opacity: 0 }}>
        {[
          [90, 238], [100, 242], [108, 238], [118, 242], [128, 238],
          [180, 240], [190, 236], [200, 242], [210, 238], [220, 240],
        ].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx="5" ry="8"
            fill="#2F6A3B" opacity="0.8" />
        ))}
      </PartGroup>

      {/* ── STOMATA (guard cell pairs) ── */}
      <PartGroup id="stomata" pose={p("stomata")} style={{ opacity: 0 }}>
        {[[100, 296], [140, 296], [180, 296], [220, 296]].map(([x, y], i) => (
          <g key={i}>
            <ellipse cx={x - 4} cy={y} rx="4" ry="3" fill="#2F6A3B" opacity="0.7" />
            <ellipse cx={x + 4} cy={y} rx="4" ry="3" fill="#2F6A3B" opacity="0.7" />
            <ellipse cx={x} cy={y} rx="2" ry="2.5" fill="#1A3D22" opacity="0.5" />
          </g>
        ))}
      </PartGroup>

      {/* ── WATER BEADS (up through vein) ── */}
      <PartGroup id="water" pose={p("water")} style={{ opacity: 0 }}>
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={160} cy={280 - i * 30} r="5"
            fill="#CFE4EC" stroke="#FBF5EC" strokeWidth="1" />
        ))}
      </PartGroup>

      {/* ── CO2 MOLECULES ── */}
      <PartGroup id="co2" pose={p("co2")} style={{ opacity: 0 }}>
        {/* CO2: one dark + two light circles */}
        <circle cx="240" cy="290" r="5" fill="#5E554D" />
        <circle cx="232" cy="290" r="4" fill="#9CA3AF" />
        <circle cx="248" cy="290" r="4" fill="#9CA3AF" />
        <circle cx="220" cy="310" r="5" fill="#5E554D" />
        <circle cx="212" cy="310" r="4" fill="#9CA3AF" />
        <circle cx="228" cy="310" r="4" fill="#9CA3AF" />
      </PartGroup>

      {/* ── OXYGEN PAIRS ── */}
      <PartGroup id="oxygen" pose={p("oxygen")} style={{ opacity: 0 }}>
        {[100, 140, 180, 220].map((x, i) => (
          <g key={i}>
            <circle cx={x} cy={282} r="5" fill="#CFE4EC" />
            <circle cx={x + 8} cy={282} r="5" fill="#CFE4EC" />
            {/* Bond */}
            <line x1={x + 5} y1={282} x2={x + 3} y2={282}
              stroke="#A0C8D8" strokeWidth="2" />
          </g>
        ))}
      </PartGroup>

      {/* ── SUGAR HEXAGON ── */}
      <PartGroup id="sugar" pose={p("sugar")} style={{ opacity: 0 }}>
        <polygon
          points="170,240 178,244 178,252 170,256 162,252 162,244"
          fill="#F7E3A1" stroke="#C9A030" strokeWidth="1.5"
        />
        <text x="170" y="250" textAnchor="middle" fontSize="7"
          fontFamily="var(--font-inter)" fill="#8B6914" fontWeight="600">
          C6
        </text>
      </PartGroup>

      {/* ── LADYBIRD (ambient detail) ── */}
      <PartGroup id="ladybird" pose={p("ladybird")} style={{ opacity: 0 }}>
        <ellipse cx="220" cy="340" rx="8" ry="6" fill="#C2475B" />
        <line x1="220" y1="334" x2="220" y2="346" stroke="#2B2420" strokeWidth="1" />
        {/* Spots */}
        <circle cx="216" cy="339" r="1.5" fill="#2B2420" />
        <circle cx="224" cy="339" r="1.5" fill="#2B2420" />
        {/* Head */}
        <circle cx="220" cy="334" r="4" fill="#2B2420" />
      </PartGroup>
    </svg>
  );
}
