import type { BadgeId } from "@/content/types";
import { cn } from "@/lib/utils";

const ENAMEL: Record<BadgeId, { base: string; deep: string }> = {
  "first-discovery": { base: "#2C6680", deep: "#1C4A5E" },
  "perfect-scholar": { base: "#A23A4D", deep: "#772536" },
  "streak-3": { base: "#386B43", deep: "#244C2E" },
  "curious-mind": { base: "#5B4B8A", deep: "#3E3166" },
};

function Glyph({ id }: { id: BadgeId }) {
  switch (id) {
    case "first-discovery":
      return (
        <path
          d="M24 13.5 L27 19.6 L33.7 20.6 L28.9 25.3 L30 32 L24 28.8 L18 32 L19.1 25.3 L14.3 20.6 L21 19.6 Z"
          fill="currentColor"
        />
      );
    case "perfect-scholar":
      return (
        <path
          d="M16.5 24.5 L21.8 29.6 L31.8 18.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "streak-3":
      return (
        <g fill="currentColor">
          <path
            d="M23 34 V22.5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path d="M23 24.4 C23 19.6 26.2 16.2 32 15.6 C31.6 21 28.4 24.2 23 24.4 Z" />
          <path d="M23 27.4 C23 23.6 20.4 21 16 20.6 C16.3 24.8 18.8 27.3 23 27.4 Z" />
        </g>
      );
    case "curious-mind":
      return (
        <g
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M17 29 L24 17 L31 29 Z" fill="none" />
          <circle cx="24" cy="17" r="3.2" stroke="none" />
          <circle cx="17" cy="29" r="3.2" stroke="none" />
          <circle cx="31" cy="29" r="3.2" stroke="none" />
        </g>
      );
  }
}

/** An enamel pin: brass rim, coloured enamel, a raised glyph. Unearned pins are a debossed outline. */
export function BadgePin({
  id,
  earned,
  className,
}: {
  id: BadgeId;
  earned: boolean;
  className?: string;
}) {
  const enamel = ENAMEL[id];
  if (!earned) {
    return (
      <svg viewBox="0 0 48 48" className={cn("size-14", className)} aria-hidden="true">
        <circle cx="24" cy="24" r="21" fill="var(--sunk)" />
        <circle
          cx="24"
          cy="24"
          r="20.25"
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />
        <g className="text-line-strong">
          <Glyph id={id} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={cn("size-14", className)} aria-hidden="true">
      <defs>
        <linearGradient id={`pin-rim-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3D58D" />
          <stop offset="0.5" stopColor="#C8963F" />
          <stop offset="1" stopColor="#8A5F17" />
        </linearGradient>
        <radialGradient id={`pin-enamel-${id}`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={enamel.base} />
          <stop offset="1" stopColor={enamel.deep} />
        </radialGradient>
      </defs>
      <ellipse cx="25" cy="44.5" rx="15" ry="2.2" fill="#2B2420" opacity="0.12" />
      <circle cx="24" cy="24" r="21.5" fill={`url(#pin-rim-${id})`} />
      <circle cx="24" cy="24" r="18" fill={`url(#pin-enamel-${id})`} />
      <circle
        cx="24"
        cy="24"
        r="18"
        fill="none"
        stroke="#000"
        strokeOpacity="0.18"
        strokeWidth="1"
      />
      <g className="text-[#FBF3E2]">
        <Glyph id={id} />
      </g>
      <path
        d="M11 17 A15 15 0 0 1 20 9.4"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
