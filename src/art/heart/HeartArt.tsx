"use client";

import { PartGroup } from "@/components/stage/PartGroup";
import type { ArtComponentProps, PartPose } from "@/content/types";

type Props = ArtComponentProps & {
  stepPose?: Record<string, PartPose>;
  focusedParts?: string[];
};

/** Anatomically believable heart art. viewBox: 0 0 320 480 */
export default function HeartArt({
  idPrefix = "h",
  variant = "full",
  stepPose = {},
}: Props) {
  const p = (id: string) => stepPose[id];
  const id = (n: string) => `${idPrefix}-${n}`;

  if (variant === "trophy") {
    return (
      <svg viewBox="0 0 80 90" width="80" height="90" aria-hidden="true">
        <defs>
          <radialGradient id={id("thg")} cx="40%" cy="30%">
            <stop offset="0%" stopColor="#E57A8A" />
            <stop offset="100%" stopColor="#8E2F40" />
          </radialGradient>
        </defs>
        <path d="M40 72 C20 58 8 44 8 30 C8 16 18 8 28 8 C34 8 38 12 40 16 C42 12 46 8 52 8 C62 8 72 16 72 30 C72 44 60 58 40 72Z"
          fill={`url(#${id("thg")})`} />
        <path d="M25 28 C22 22 26 16 30 18 C32 16 36 16 38 22"
          fill="none" stroke="#F3C6C6" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 480" width="100%" height="100%"
      role="img" aria-label="Heart diagram">
      <title>Heart</title>
      <defs>
        <radialGradient id={id("hg")} cx="35%" cy="25%">
          <stop offset="0%" stopColor="#D95C70" />
          <stop offset="60%" stopColor="#C2475B" />
          <stop offset="100%" stopColor="#8E2F40" />
        </radialGradient>
        <radialGradient id={id("chamberg")} cx="50%" cy="50%">
          <stop offset="0%" stopColor="#F3C6C6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#E57A8A" stopOpacity="0.4" />
        </radialGradient>
        <linearGradient id={id("aortag")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#C2475B" />
          <stop offset="100%" stopColor="#D95C70" />
        </linearGradient>
        <linearGradient id={id("pulsg")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7E6A9A" />
          <stop offset="100%" stopColor="#9A85B8" />
        </linearGradient>
        <linearGradient id={id("vcg")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9A85B8" />
          <stop offset="100%" stopColor="#7E6A9A" />
        </linearGradient>
      </defs>

      {/* ── CHEST OUTLINE ── */}
      <PartGroup id="chest-outline" pose={p("chest-outline")} style={{ opacity: 0 }}>
        <path d="M80 80 C80 50 100 30 120 28 L160 24 L200 28 C220 30 240 50 240 80 L248 300 C248 340 220 380 160 390 C100 380 72 340 72 300Z"
          fill="none" stroke="#D9D0EE" strokeWidth="2" strokeDasharray="8 6" />
      </PartGroup>

      {/* ── HEART WHOLE (the full muscle surface) ── */}
      <PartGroup id="heart-whole" pose={p("heart-whole")} transformOrigin="center">
        {/* Main muscle body */}
        <path d="M160 360 C120 340 72 300 68 250 C64 200 80 160 110 148 C130 140 148 148 160 160 C172 148 190 140 210 148 C240 160 256 200 252 250 C248 300 200 340 160 360Z"
          fill={`url(#${id("hg")})`} />
        {/* Muscle fiber lines */}
        {[
          "M100 250 C110 270 130 290 160 300",
          "M220 250 C210 270 190 290 160 300",
          "M90 210 C105 230 125 250 140 270",
          "M230 210 C215 230 195 250 180 270",
          "M110 180 C120 200 140 220 155 240",
          "M210 180 C200 200 180 220 165 240",
        ].map((d, i) => (
          <path key={i} d={d} fill="none"
            stroke="#A3384B" strokeWidth="1.5" strokeOpacity="0.35" strokeLinecap="round" />
        ))}
        {/* Broad glossy highlight */}
        <path d="M130 155 C118 165 108 185 108 210 C130 185 155 170 175 165"
          fill="none" stroke="#F3C6C6" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.4" />
        {/* Surface coronary artery */}
        <path d="M160 160 C180 165 210 180 220 210 C225 225 220 245 210 260"
          fill="none" stroke="#D95C70" strokeWidth="3" strokeLinecap="round" />
        <path d="M160 160 C140 165 110 180 100 210 C95 225 100 245 110 260"
          fill="none" stroke="#D95C70" strokeWidth="3" strokeLinecap="round" />
        {/* Fat patches in grooves */}
        <ellipse cx="160" cy="195" rx="18" ry="6"
          fill="#F7E3A1" fillOpacity="0.55" />
        {/* Edges */}
        <path d="M160 360 C120 340 72 300 68 250 C64 200 80 160 110 148 C130 140 148 148 160 160 C172 148 190 140 210 148 C240 160 256 200 252 250 C248 300 200 340 160 360Z"
          fill="none" stroke="#8E2F40" strokeWidth="2" />
      </PartGroup>

      {/* ── WALL FRONT (fades to reveal chambers) ── */}
      <PartGroup id="wall-front" pose={p("wall-front")} transformOrigin="center">
        <path d="M160 355 C120 338 75 300 70 252 C66 202 82 162 112 150 C132 142 150 150 160 162 C170 150 188 142 208 150 C238 162 254 202 250 252 C246 300 200 338 160 355Z"
          fill={`url(#${id("hg")})`} fillOpacity="0.92" />
      </PartGroup>

      {/* ── RIGHT ATRIUM ── */}
      <PartGroup id="atrium-right" pose={p("atrium-right")} style={{ opacity: 0 }}>
        <path d="M100 170 C85 180 80 200 82 220 C84 240 95 255 110 260 L148 250 L148 175Z"
          fill={`url(#${id("chamberg")})`} />
        <path d="M100 170 C85 180 80 200 82 220 C84 240 95 255 110 260 L148 250 L148 175Z"
          fill="none" stroke="#C2475B" strokeWidth="1.5" strokeOpacity="0.5" />
      </PartGroup>

      {/* ── LEFT ATRIUM ── */}
      <PartGroup id="atrium-left" pose={p("atrium-left")} style={{ opacity: 0 }}>
        <path d="M220 170 C235 180 240 200 238 220 C236 240 225 255 210 260 L172 250 L172 175Z"
          fill={`url(#${id("chamberg")})`} />
        <path d="M220 170 C235 180 240 200 238 220 C236 240 225 255 210 260 L172 250 L172 175Z"
          fill="none" stroke="#C2475B" strokeWidth="1.5" strokeOpacity="0.5" />
      </PartGroup>

      {/* ── RIGHT VENTRICLE ── */}
      <PartGroup id="ventricle-right" pose={p("ventricle-right")} style={{ opacity: 0 }}>
        <path d="M82 240 C78 265 80 295 90 320 C100 340 120 355 148 360 L148 250Z"
          fill={`url(#${id("chamberg")})`} />
        <path d="M82 240 C78 265 80 295 90 320 C100 340 120 355 148 360 L148 250Z"
          fill="none" stroke="#7E6A9A" strokeWidth="1.5" strokeOpacity="0.5" />
      </PartGroup>

      {/* ── LEFT VENTRICLE ── */}
      <PartGroup id="ventricle-left" pose={p("ventricle-left")} style={{ opacity: 0 }}>
        <path d="M238 240 C242 265 240 295 230 320 C220 340 200 355 172 360 L172 250Z"
          fill={`url(#${id("chamberg")})`} />
        <path d="M238 240 C242 265 240 295 230 320 C220 340 200 355 172 360 L172 250Z"
          fill="none" stroke="#C2475B" strokeWidth="1.5" strokeOpacity="0.5" />
      </PartGroup>

      {/* ── SEPTUM ── */}
      <PartGroup id="septum" pose={p("septum")} style={{ opacity: 0 }}>
        <rect x="155" y="170" width="10" height="190" rx="5"
          fill="#A3384B" fillOpacity="0.6" />
      </PartGroup>

      {/* ── VALVES (thin translucent leaflets) ── */}
      <PartGroup id="valve-tricuspid" pose={p("valve-tricuspid")} transformOrigin="center bottom" style={{ opacity: 0 }}>
        <path d="M100 248 C110 240 130 242 148 248"
          fill="none" stroke="#F3C6C6" strokeWidth="4" strokeOpacity="0.8" strokeLinecap="round" />
        <path d="M108 248 C112 240 128 240 140 248"
          fill="none" stroke="#E57A8A" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      </PartGroup>

      <PartGroup id="valve-mitral" pose={p("valve-mitral")} transformOrigin="center bottom" style={{ opacity: 0 }}>
        <path d="M172 248 C185 240 210 242 225 248"
          fill="none" stroke="#F3C6C6" strokeWidth="4" strokeOpacity="0.8" strokeLinecap="round" />
        <path d="M178 248 C188 240 212 240 220 248"
          fill="none" stroke="#E57A8A" strokeWidth="1.5" strokeOpacity="0.5" strokeLinecap="round" />
      </PartGroup>

      <PartGroup id="valve-pulmonary" pose={p("valve-pulmonary")} transformOrigin="center bottom" style={{ opacity: 0 }}>
        <path d="M100 195 C110 188 130 188 148 195"
          fill="none" stroke="#D9D0EE" strokeWidth="4" strokeOpacity="0.8" strokeLinecap="round" />
      </PartGroup>

      <PartGroup id="valve-aortic" pose={p("valve-aortic")} transformOrigin="center bottom" style={{ opacity: 0 }}>
        <path d="M172 195 C182 188 202 188 218 195"
          fill="none" stroke="#D9D0EE" strokeWidth="4" strokeOpacity="0.8" strokeLinecap="round" />
      </PartGroup>

      {/* ── GREAT VESSELS ── */}
      <PartGroup id="aortic-arch" pose={p("aortic-arch")} style={{ opacity: 0 }}>
        <path d="M190 148 C195 130 210 115 230 108 C250 100 270 108 278 120"
          fill="none" stroke={`url(#${id("aortag")})`} strokeWidth="14" strokeLinecap="round" />
        <path d="M190 148 C195 130 210 115 230 108 C250 100 270 108 278 120"
          fill="none" stroke="#F3C6C6" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" />
      </PartGroup>

      <PartGroup id="pulmonary-trunk" pose={p("pulmonary-trunk")} style={{ opacity: 0 }}>
        <path d="M130 148 C125 128 115 112 100 108"
          fill="none" stroke={`url(#${id("pulsg")})`} strokeWidth="14" strokeLinecap="round" />
        <path d="M130 148 C125 128 115 112 100 108"
          fill="none" stroke="#D9D0EE" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.4" />
      </PartGroup>

      <PartGroup id="vena-cava" pose={p("vena-cava")} style={{ opacity: 0 }}>
        {/* Superior */}
        <rect x="95" y="70" width="16" height="80" rx="8" fill={`url(#${id("vcg")})`} />
        {/* Inferior */}
        <rect x="95" y="295" width="16" height="60" rx="8" fill={`url(#${id("vcg")})`} />
      </PartGroup>

      <PartGroup id="pulmonary-veins" pose={p("pulmonary-veins")} style={{ opacity: 0 }}>
        <path d="M225 200 C240 195 255 185 268 170"
          fill="none" stroke="#C2475B" strokeWidth="10" strokeLinecap="round" />
        <path d="M225 220 C242 218 258 210 270 200"
          fill="none" stroke="#C2475B" strokeWidth="10" strokeLinecap="round" />
      </PartGroup>

      {/* ── FAT PATCHES ── */}
      <PartGroup id="fat-patches" pose={p("fat-patches")} style={{ opacity: 0 }}>
        <ellipse cx="160" cy="195" rx="20" ry="7" fill="#F7E3A1" fillOpacity="0.6" />
        <ellipse cx="140" cy="250" rx="10" ry="4" fill="#F7E3A1" fillOpacity="0.5" />
        <ellipse cx="180" cy="250" rx="10" ry="4" fill="#F7E3A1" fillOpacity="0.5" />
      </PartGroup>

      {/* ── CORONARY ARTERIES (surface) ── */}
      <PartGroup id="coronary-arteries" pose={p("coronary-arteries")} style={{ opacity: 0 }}>
        <path d="M160 162 C180 168 210 182 218 210 C222 225 218 245 208 258"
          fill="none" stroke="#D95C70" strokeWidth="3" strokeLinecap="round" />
        <path d="M160 162 C140 168 110 182 102 210 C98 225 102 245 112 258"
          fill="none" stroke="#D95C70" strokeWidth="3" strokeLinecap="round" />
      </PartGroup>

      {/* ── BLOOD BEADS ── */}
      <PartGroup id="blood-rich" pose={p("blood-rich")} style={{ opacity: 0 }}>
        <circle cx="210" cy="200" r="6" fill="#C2475B" stroke="#FBF5EC" strokeWidth="1" />
        <circle cx="215" cy="230" r="6" fill="#C2475B" stroke="#FBF5EC" strokeWidth="1" />
        <circle cx="205" cy="260" r="6" fill="#C2475B" stroke="#FBF5EC" strokeWidth="1" />
      </PartGroup>

      <PartGroup id="blood-poor" pose={p("blood-poor")} style={{ opacity: 0 }}>
        <circle cx="110" cy="200" r="6" fill="#7E6A9A" stroke="#FBF5EC" strokeWidth="1" />
        <circle cx="105" cy="230" r="6" fill="#7E6A9A" stroke="#FBF5EC" strokeWidth="1" />
        <circle cx="115" cy="260" r="6" fill="#7E6A9A" stroke="#FBF5EC" strokeWidth="1" />
      </PartGroup>

      {/* ── LOOP OUTLINES ── */}
      <PartGroup id="loop-lungs" pose={p("loop-lungs")} style={{ opacity: 0 }}>
        <path d="M100 148 C80 100 90 70 100 60 C110 50 125 55 128 70 C130 55 138 48 148 55 C160 65 155 95 140 120 C132 140 110 148 100 148Z"
          fill="#7E6A9A" fillOpacity="0.25" stroke="#7E6A9A" strokeWidth="1.5" />
        <path d="M100 148 C80 100 90 70 100 60 C110 50 125 55 128 70 C130 55 138 48 148 55 C160 65 155 95 140 120 C132 140 110 148 100 148Z"
          fill="none" stroke="#9A85B8" strokeWidth="1.5" />
      </PartGroup>

      <PartGroup id="loop-body" pose={p("loop-body")} style={{ opacity: 0 }}>
        <path d="M220 148 C240 100 230 70 220 60 C210 50 195 55 192 70 C190 55 182 48 172 55 C160 65 165 95 180 120 C188 140 210 148 220 148Z"
          fill="#C2475B" fillOpacity="0.2" stroke="#C2475B" strokeWidth="1.5" />
        <path d="M220 148 C240 100 230 70 220 60 C210 50 195 55 192 70 C190 55 182 48 172 55 C160 65 165 95 180 120 C188 140 210 148 220 148Z"
          fill="none" stroke="#D95C70" strokeWidth="1.5" />
      </PartGroup>

      {/* ── LUNGS/BODY OUTLINES ── */}
      <PartGroup id="lungs-outline" pose={p("lungs-outline")} style={{ opacity: 0 }}>
        <ellipse cx="90" cy="80" rx="30" ry="40" fill="#D9D0EE" fillOpacity="0.3"
          stroke="#9A85B8" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="90" y="82" textAnchor="middle" fontSize="11" fontFamily="var(--font-inter)"
          fill="#7E6A9A" fontWeight="600">Lungs</text>
      </PartGroup>

      <PartGroup id="body-outline" pose={p("body-outline")} style={{ opacity: 0 }}>
        <ellipse cx="230" cy="80" rx="30" ry="40" fill="#F3C6C6" fillOpacity="0.3"
          stroke="#C2475B" strokeWidth="1.5" strokeDasharray="5 4" />
        <text x="230" y="82" textAnchor="middle" fontSize="11" fontFamily="var(--font-inter)"
          fill="#A3384B" fontWeight="600">Body</text>
      </PartGroup>
    </svg>
  );
}
