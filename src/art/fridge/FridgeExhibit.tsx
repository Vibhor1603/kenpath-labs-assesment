import type { ExhibitArtProps } from "@/content/types";

/** Front view of a single-door fridge: enamel shell, chrome handle, kick grille, feet. */
export function FridgeExhibit({ idPrefix, tone = "full", className }: ExhibitArtProps) {
  const id = (s: string) => `${idPrefix}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;

  if (tone === "silhouette") {
    return (
      <svg viewBox="0 0 240 470" className={className} aria-hidden="true">
        <path d="M200 24 L214 32 V436 L200 440 Z" fill="currentColor" opacity="0.7" />
        <rect x="22" y="18" width="180" height="424" rx="14" fill="currentColor" />
        <rect x="44" y="440" width="16" height="12" rx="2" fill="currentColor" />
        <rect x="170" y="440" width="16" height="12" rx="2" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 470"
      className={className}
      role="img"
      aria-label="A refrigerator"
    >
      <defs>
        <linearGradient id={id("enamel")} x1="0" y1="0" x2="1" y2="0.15">
          <stop offset="0" stopColor="#FFFEFB" />
          <stop offset="0.55" stopColor="#F3EEE5" />
          <stop offset="1" stopColor="#E2DACC" />
        </linearGradient>
        <linearGradient id={id("side")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D8CFBF" />
          <stop offset="0.8" stopColor="#C8BEAD" />
          <stop offset="1" stopColor="#CFE0E6" />
        </linearGradient>
        <linearGradient id={id("band")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id("chrome")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#868C93" />
          <stop offset="0.42" stopColor="#F6F8FA" />
          <stop offset="1" stopColor="#9AA1A9" />
        </linearGradient>
        <linearGradient id={id("shade")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2B2420" stopOpacity="0" />
          <stop offset="1" stopColor="#2B2420" stopOpacity="0.08" />
        </linearGradient>
        <radialGradient id={id("contact")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#2B2420" stopOpacity="0.3" />
          <stop offset="1" stopColor="#2B2420" stopOpacity="0" />
        </radialGradient>
        <clipPath id={id("door")}>
          <rect x="26" y="22" width="172" height="386" rx="12" />
        </clipPath>
      </defs>

      <ellipse cx="122" cy="452" rx="112" ry="10" fill={url("contact")} />

      {/* feet */}
      <rect x="44" y="438" width="16" height="13" rx="2.5" fill="#3A3633" />
      <rect x="170" y="438" width="16" height="13" rx="2.5" fill="#3A3633" />

      {/* side panel gives the box its depth (shadow side, cool sky bounce on the edge) */}
      <path d="M200 24 L214 32 V436 L200 440 Z" fill={url("side")} />

      {/* body */}
      <rect
        x="22"
        y="18"
        width="180"
        height="424"
        rx="14"
        fill={url("enamel")}
        stroke="#CDC4B4"
        strokeWidth="1"
      />

      {/* kick grille */}
      <rect x="32" y="414" width="160" height="20" rx="4" fill="#D9D1C3" />
      {Array.from({ length: 11 }, (_, i) => (
        <rect
          key={i}
          x={40 + i * 13.6}
          y="419"
          width="8"
          height="10"
          rx="1.5"
          fill="#B4AB9B"
        />
      ))}

      {/* door */}
      <rect
        x="26"
        y="22"
        width="172"
        height="386"
        rx="12"
        fill={url("enamel")}
        stroke="#CBC2B1"
        strokeWidth="1"
      />
      <g clipPath={url("door")}>
        <path d="M78 22 H112 L64 408 H30 Z" fill={url("band")} opacity="0.55" />
        <rect x="26" y="22" width="172" height="386" fill={url("shade")} />
        <rect x="190" y="22" width="8" height="386" fill="#2B2420" opacity="0.05" />
      </g>
      <path d="M38 23 H186" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

      {/* badge */}
      <rect x="96" y="40" width="32" height="9" rx="4.5" fill={url("chrome")} />

      {/* handle with standoffs */}
      <rect x="35" y="148" width="12" height="7" rx="2" fill="#8C9299" />
      <rect x="35" y="285" width="12" height="7" rx="2" fill="#8C9299" />
      <rect x="37" y="140" width="9" height="160" rx="4.5" fill={url("chrome")} />
      <rect x="40" y="148" width="1.3" height="144" rx="0.6" fill="#FFFFFF" />
      <rect x="44" y="146" width="2" height="148" rx="1" fill="#2B2420" opacity="0.12" />
    </svg>
  );
}
