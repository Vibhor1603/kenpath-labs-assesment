"use client";

import { PartGroup } from "@/components/stage/PartGroup";
import type { ArtComponentProps, PartPose } from "@/content/types";

type Props = ArtComponentProps & {
  stepPose?: Record<string, PartPose>;
  focusedParts?: string[];
};

/** Semi-realistic inline SVG fridge art. viewBox: 0 0 320 520 */
export default function FridgeArt({
  idPrefix = "f",
  variant = "full",
  stepPose = {},
  focusedParts = [],
}: Props) {
  const p = (id: string) => stepPose[id];
  const isTrophy = variant === "trophy";
  const id = (n: string) => `${idPrefix}-${n}`;

  if (isTrophy) {
    return (
      <svg viewBox="0 0 80 130" width="80" height="130" aria-hidden="true">
        <defs>
          <linearGradient id={id("ts")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F4EFE6" />
            <stop offset="100%" stopColor="#E0D8CC" />
          </linearGradient>
        </defs>
        <rect x="10" y="2" width="60" height="118" rx="6" fill={`url(#${id("ts")})`} />
        <rect x="10" y="2" width="60" height="32" rx="6" fill="#DDD5C8" />
        <rect x="10" y="30" width="60" height="4" fill="#C8BFB0" />
        <rect x="60" y="18" width="5" height="36" rx="2.5" fill="#9CA3AF" />
        <rect x="62" y="24" width="1.5" height="24" rx="0.75" fill="#E5E7EB" opacity="0.7" />
        <rect x="12" y="8" width="2" height="2" rx="1" fill="#C8BFB0" opacity="0.5" />
        <rect x="14" y="4" width="56" height="2" rx="1" fill="#F9F6F0" opacity="0.5" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 320 520"
      width="100%"
      height="100%"
      role="img"
      aria-label="Refrigerator diagram"
    >
      <title>Refrigerator</title>
      <defs>
        {/* Shell gradient — warm white enamel */}
        <linearGradient id={id("sg")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#EDE7DC" />
          <stop offset="40%" stopColor="#F4EFE6" />
          <stop offset="75%" stopColor="#F8F4EE" />
          <stop offset="100%" stopColor="#EAE3D8" />
        </linearGradient>
        {/* Door inner — lighter */}
        <linearGradient id={id("dig")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0EAE0" />
          <stop offset="100%" stopColor="#E8E0D4" />
        </linearGradient>
        {/* Interior cool white */}
        <linearGradient id={id("intg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#EFF6FA" />
          <stop offset="15%" stopColor="#F5FAFB" />
          <stop offset="100%" stopColor="#F0F4F6" />
        </linearGradient>
        {/* Freezer interior */}
        <linearGradient id={id("fzg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F2F6" />
          <stop offset="100%" stopColor="#D8EAF0" />
        </linearGradient>
        {/* Handle chrome */}
        <linearGradient id={id("hg")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9CA3AF" />
          <stop offset="30%" stopColor="#E5E7EB" />
          <stop offset="60%" stopColor="#D1D5DB" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </linearGradient>
        {/* Copper pipe */}
        <linearGradient id={id("cpg")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#B8733A" />
          <stop offset="50%" stopColor="#E7A56F" />
          <stop offset="100%" stopColor="#B8733A" />
        </linearGradient>
        {/* Compressor dark */}
        <radialGradient id={id("cmpg")} cx="35%" cy="30%">
          <stop offset="0%" stopColor="#4B4B4B" />
          <stop offset="100%" stopColor="#1C1C1C" />
        </radialGradient>
        {/* Focus halo */}
        <radialGradient id={id("halo")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3E0" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFF3E0" stopOpacity="0" />
        </radialGradient>
        {/* Clip: shell interior */}
        <clipPath id={id("intclip")}>
          <rect x="62" y="22" width="196" height="418" rx="6" />
        </clipPath>
        {/* Clip: door */}
        <clipPath id={id("dclip")}>
          <rect x="60" y="20" width="200" height="440" rx="10" />
        </clipPath>
        {/* Hatching pattern */}
        <pattern id={id("hatch")} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <line x1="0" y1="8" x2="8" y2="0" stroke="#5E554D" strokeWidth="0.8" opacity="0.3" />
        </pattern>
      </defs>

      {/* ── HATCHING (x-ray cutaway edges) ── */}
      <PartGroup id="hatching" pose={p("hatching")} style={{ opacity: 0 }}>
        <rect x="60" y="20" width="8" height="440" fill={`url(#${id("hatch")})`} />
        <rect x="252" y="20" width="8" height="440" fill={`url(#${id("hatch")})`} />
      </PartGroup>

      {/* ── SHELL (outer body) ── */}
      <PartGroup id="shell" pose={p("shell")} transformOrigin="center">
        <rect x="60" y="20" width="200" height="440" rx="12" fill={`url(#${id("sg")})`} />
        {/* Freezer divider */}
        <rect x="62" y="148" width="196" height="3" fill="#D0C9BD" />
        {/* Side light rim */}
        <rect x="258" y="22" width="2" height="436" rx="1" fill="#F9F6F0" opacity="0.5" />
        {/* Bottom feet */}
        <rect x="80" y="458" width="12" height="8" rx="2" fill="#C8BFB0" />
        <rect x="228" y="458" width="12" height="8" rx="2" fill="#C8BFB0" />
        {/* Contact shadow */}
        <ellipse cx="160" cy="470" rx="90" ry="8"
          fill="rgba(43,36,32,0.18)" />
      </PartGroup>

      {/* ── FEET (separate for transform) ── */}
      <PartGroup id="feet" pose={p("feet")}>
        <rect x="80" y="460" width="14" height="6" rx="2" fill="#B8B0A4" />
        <rect x="226" y="460" width="14" height="6" rx="2" fill="#B8B0A4" />
      </PartGroup>

      {/* ── INTERIOR (inside, visible when door opens) ── */}
      <PartGroup id="interior" pose={p("interior")} style={{ opacity: 0 }}>
        {/* Interior background */}
        <rect x="62" y="22" width="196" height="416" rx="6" fill={`url(#${id("intg")})`} />
        {/* LED glow top */}
        <ellipse cx="160" cy="32" rx="60" ry="20" fill="#EFF6FA" fillOpacity="0.8" />
        {/* Freezer section */}
        <rect x="62" y="22" width="196" height="128" fill={`url(#${id("fzg")})`} />
        <rect x="62" y="148" width="196" height="1" fill="#B8D4DC" />
        {/* Glass shelves */}
        <rect x="70" y="220" width="180" height="3" rx="1.5" fill="#CFE4EC" fillOpacity="0.7" />
        <rect x="70" y="220" width="180" height="1" rx="0.5" fill="#FBF5EC" fillOpacity="0.8" />
        <rect x="70" y="290" width="180" height="3" rx="1.5" fill="#CFE4EC" fillOpacity="0.7" />
        <rect x="70" y="290" width="180" height="1" rx="0.5" fill="#FBF5EC" fillOpacity="0.8" />
        <rect x="70" y="360" width="180" height="3" rx="1.5" fill="#CFE4EC" fillOpacity="0.7" />
        <rect x="70" y="360" width="180" height="1" rx="0.5" fill="#FBF5EC" fillOpacity="0.8" />
        {/* Food: milk bottle */}
        <rect x="90" y="232" width="22" height="52" rx="6" fill="#F0F4F6" />
        <rect x="95" y="228" width="12" height="6" rx="3" fill="#E0E8EE" />
        <rect x="90" y="238" width="22" height="10" fill="#D4E8F4" fillOpacity="0.5" />
        {/* Food: two lemons */}
        <ellipse cx="135" cy="260" rx="12" ry="9" fill="#F7E3A1" />
        <ellipse cx="152" cy="260" rx="12" ry="9" fill="#F0D884" />
        {/* Food: jar */}
        <rect x="168" y="235" width="28" height="40" rx="4" fill="#D4EED6" fillOpacity="0.8" />
        <rect x="166" y="233" width="32" height="6" rx="3" fill="#B8B0A4" />
        {/* Food: half cucumber */}
        <ellipse cx="130" cy="330" rx="20" ry="12" fill="#5E8E62" />
        <ellipse cx="130" cy="330" rx="14" ry="8" fill="#7FB882" fillOpacity="0.8" />
        <ellipse cx="130" cy="330" rx="8" ry="5" fill="#9BD4A0" fillOpacity="0.5" />
        {/* Crisper drawer outline */}
        <rect x="70" y="380" width="180" height="46" rx="4" fill="#E4ECF0" fillOpacity="0.6" />
      </PartGroup>

      {/* ── EVAPORATOR (brushed aluminum in freezer) ── */}
      <PartGroup id="evaporator" pose={p("evaporator")} style={{ opacity: 0 }}>
        <rect x="72" y="28" width="176" height="108" rx="4" fill="#C8D8E0" />
        {/* Embossed channels */}
        {[38, 52, 66, 80, 94, 108, 122].map((y) => (
          <rect key={y} x="74" y={y} width="172" height="1.5" rx="0.75" fill="#B0C4CC" />
        ))}
        {/* Frost specks — also part of frost group */}
        <circle cx="100" cy="70" r="2" fill="#EFF6FA" opacity="0.8" />
        <circle cx="160" cy="85" r="1.5" fill="#EFF6FA" opacity="0.7" />
        <circle cx="200" cy="60" r="2" fill="#EFF6FA" opacity="0.75" />
      </PartGroup>

      {/* ── PIPES (copper loop, visible in x-ray) ── */}
      <PartGroup id="pipes" pose={p("pipes")} style={{ opacity: 0 }}>
        {/* Main loop path */}
        <path
          d="M160 420 C100 420 72 390 72 340 L72 200 C72 160 80 148 110 148
             L210 148 C240 148 248 160 248 200 L248 340
             C248 390 220 420 160 420Z"
          fill="none"
          stroke={`url(#${id("cpg")})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Highlight on pipe */}
        <path
          d="M160 420 C100 420 72 390 72 340 L72 200 C72 160 80 148 110 148
             L210 148 C240 148 248 160 248 200 L248 340
             C248 390 220 420 160 420Z"
          fill="none"
          stroke="#E7A56F"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />
      </PartGroup>

      {/* ── CONDENSER (back coils, right side) ── */}
      <PartGroup id="condenser" pose={p("condenser")} transformOrigin="right center" style={{ opacity: 0 }}>
        {/* Zigzag coil tubes */}
        {[240, 258, 276, 294, 312, 330].map((y, i) => (
          <rect key={i} x="264" y={y} width="44" height="10" rx="5"
            fill="#2B2420" stroke="#3D3530" strokeWidth="1" />
        ))}
        {/* Wire fins */}
        {[264, 272, 280, 288, 296, 304].map((x) => (
          <line key={x} x1={x} y1="238" x2={x} y2="342"
            stroke="#3D3530" strokeWidth="0.75" strokeOpacity="0.6" />
        ))}
      </PartGroup>

      {/* ── EXPANSION VALVE (narrow capillary tube) ── */}
      <PartGroup id="expansion-valve" pose={p("expansion-valve")} style={{ opacity: 0 }}>
        {/* Coiled capillary tube */}
        <path
          d="M80 320 C72 320 68 316 68 308 C68 300 76 296 84 300
             C92 304 92 312 84 316 C76 320 72 316 72 308"
          fill="none"
          stroke={`url(#${id("cpg")})`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Very cold label zone marker */}
        <rect x="58" y="296" width="46" height="28" rx="4"
          fill="#CFE4EC" fillOpacity="0.2" />
      </PartGroup>

      {/* ── COMPRESSOR (black dome, bottom back) ── */}
      <PartGroup id="compressor" pose={p("compressor")} transformOrigin="center bottom" style={{ opacity: 0 }}>
        {/* Dome */}
        <ellipse cx="160" cy="440" rx="48" ry="28" fill={`url(#${id("cmpg")})`} />
        {/* Matte sheen */}
        <ellipse cx="148" cy="428" rx="28" ry="12" fill="#5A5A5A" fillOpacity="0.35" />
        {/* Copper pipe stubs */}
        <rect x="140" y="413" width="6" height="18" rx="3" fill={`url(#${id("cpg")})`} />
        <rect x="174" y="413" width="6" height="18" rx="3" fill={`url(#${id("cpg")})`} />
        {/* Rubber mounts */}
        <ellipse cx="125" cy="466" rx="8" ry="3" fill="#3D3530" />
        <ellipse cx="195" cy="466" rx="8" ry="3" fill="#3D3530" />
      </PartGroup>

      {/* ── REFRIGERANT (placeholder; beads handled by Beads component) ── */}
      <PartGroup id="refrigerant" pose={p("refrigerant")} style={{ opacity: 0 }}>
        {/* Visual indicator beads along loop */}
        <circle cx="160" cy="148" r="5" fill="#CFE4EC" stroke="#FBF5EC" strokeWidth="1" />
        <circle cx="248" cy="280" r="5" fill="#E2703A" stroke="#FBF5EC" strokeWidth="1" />
        <circle cx="80" cy="320" r="5" fill="#2F7F8C" stroke="#FBF5EC" strokeWidth="1" />
        <circle cx="160" cy="420" r="5" fill="#F6C9A8" stroke="#FBF5EC" strokeWidth="1" />
      </PartGroup>

      {/* ── HEAT IN ARROWS (warm air entering) ── */}
      <PartGroup id="heat-in-arrows" pose={p("heat-in-arrows")} style={{ opacity: 0 }}>
        {[180, 200, 160].map((cx, i) => (
          <g key={i}>
            <path
              d={`M${cx} ${230 + i * 30} C${cx - 4} ${224 + i * 30} ${cx + 4} ${218 + i * 30} ${cx} ${212 + i * 30}`}
              fill="none"
              stroke="#E2703A"
              strokeWidth="2"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />
            {/* Arrowhead */}
            <polygon
              points={`${cx - 4},${215 + i * 30} ${cx + 4},${215 + i * 30} ${cx},${208 + i * 30}`}
              fill="#E2703A"
              fillOpacity="0.5"
            />
          </g>
        ))}
      </PartGroup>

      {/* ── HEAT OUT (shimmer lines rising from condenser) ── */}
      <PartGroup id="heat-out" pose={p("heat-out")} style={{ opacity: 0 }}>
        {[270, 284, 298].map((x, i) => (
          <path
            key={i}
            d={`M${x} 238 C${x - 3} 228 ${x + 3} 218 ${x} 208 C${x - 3} 198 ${x + 3} 188 ${x} 178`}
            fill="none"
            stroke="#E2703A"
            strokeWidth="1.5"
            strokeOpacity="0.45"
            strokeLinecap="round"
          />
        ))}
      </PartGroup>

      {/* ── FROST SPECKS ── */}
      <PartGroup id="frost" pose={p("frost")} style={{ opacity: 0 }}>
        <circle cx="68" cy="300" r="2.5" fill="#CFE4EC" />
        <circle cx="78" cy="308" r="1.5" fill="#E8F4F8" />
        <circle cx="62" cy="312" r="2" fill="#CFE4EC" opacity="0.8" />
        <circle cx="90" cy="302" r="1.5" fill="#CFE4EC" opacity="0.6" />
      </PartGroup>

      {/* ── MAGNIFIER (step 5) ── */}
      <PartGroup id="magnifier" pose={p("magnifier")} style={{ opacity: 0, scale: 0.94 }}>
        <circle cx="90" cy="305" r="44" fill="#CFE4EC" fillOpacity="0.18"
          stroke="#2B2420" strokeWidth="2" />
        <ellipse cx="78" cy="292" rx="14" ry="8"
          fill="#FFF3E0" fillOpacity="0.3" />
        <line x1="125" y1="340" x2="148" y2="360"
          stroke="#5E554D" strokeWidth="6" strokeLinecap="round" />
      </PartGroup>

      {/* ── COLD PUFF (easter egg) ── */}
      <PartGroup id="cold-puff" pose={p("cold-puff")} style={{ opacity: 0 }}>
        <ellipse cx="160" cy="160" rx="40" ry="16" fill="#CFE4EC" fillOpacity="0.45" />
        <ellipse cx="140" cy="168" rx="20" ry="10" fill="#CFE4EC" fillOpacity="0.35" />
        <ellipse cx="180" cy="166" rx="24" ry="12" fill="#CFE4EC" fillOpacity="0.3" />
      </PartGroup>

      {/* ── GASKET (door seal rubber) ── */}
      <PartGroup id="gasket" pose={p("gasket")} style={{ opacity: 0 }}>
        <rect x="62" y="22" width="196" height="416" rx="8"
          fill="none" stroke="#4A433D" strokeWidth="5" />
        {/* Ribbed seam highlight */}
        <rect x="62" y="22" width="196" height="416" rx="8"
          fill="none" stroke="#6B6059" strokeWidth="1.5" strokeDasharray="8 6" />
      </PartGroup>

      {/* ── DOOR INNER FACE (visible inside door when open) ── */}
      <PartGroup id="door-inner" pose={p("door-inner")} style={{ opacity: 0 }}>
        <rect x="62" y="22" width="196" height="416" rx="8" fill={`url(#${id("dig")})`} />
        {/* Door bins */}
        <rect x="68" y="220" width="184" height="48" rx="4" fill="#E8E0D4" />
        <rect x="68" y="280" width="184" height="40" rx="4" fill="#E8E0D4" />
        <rect x="68" y="330" width="184" height="80" rx="4" fill="#E0D8CC" />
      </PartGroup>

      {/* ── DOOR (main panel, swings open from left/hinge) ── */}
      <PartGroup id="door" pose={p("door")} transformOrigin="left center">
        {/* Door panel */}
        <rect x="60" y="20" width="200" height="440" rx="12" fill={`url(#${id("sg")})`} />
        {/* Freezer divider line on door */}
        <rect x="62" y="148" width="196" height="2" fill="#D0C9BD" />
        {/* Broad reflection band */}
        <rect x="70" y="80" width="140" height="280" rx="4"
          fill="#FFF3E0" fillOpacity="0.08" />
        {/* Chrome handle */}
        <rect x="232" y="168" width="12" height="120" rx="6" fill={`url(#${id("hg")})`} />
        {/* Handle specular streak */}
        <rect x="234" y="172" width="2.5" height="112" rx="1.25" fill="#FFF3E0" fillOpacity="0.6" />
        {/* Brand badge (embossed, no text) */}
        <rect x="82" y="456" width="30" height="10" rx="3"
          fill="#E0D8CC" stroke="#D0C9BD" strokeWidth="1" />
        {/* Bottom edge shadow */}
        <rect x="60" y="450" width="200" height="10" rx="6"
          fill="#D8D0C4" opacity="0.4" />
        {/* Right edge dark shadow */}
        <rect x="254" y="20" width="6" height="440" rx="3"
          fill="#C8BFAF" opacity="0.5" />
      </PartGroup>
    </svg>
  );
}
