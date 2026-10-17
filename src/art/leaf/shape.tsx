/**
 * A broad mango-like leaf drawn in local coordinates: petiole base at (0, 0),
 * tip at (300, 0). The blade is a little asymmetric with one nibbled notch.
 */

export const BLADE =
  "M0 0 C38 -40 128 -64 208 -52 C250 -44 284 -20 300 0 C284 18 248 40 202 48 C176 52 166 46 154 50 C142 55 128 57 118 56 C68 52 30 32 0 0 Z";

export const MIDRIB = "M0 -2.2 Q150 -6 298 0 Q150 1.6 0 2.2 Z";
export const MIDRIB_LINE = "M-24 7 L0 0 Q150 -4 296 0";

function halfWidth(x: number, upper: boolean): number {
  const t = Math.min(1, Math.max(0, x / 300));
  const peak = upper ? 56 : 50;
  return peak * Math.pow(Math.sin(Math.PI * Math.pow(t, upper ? 0.9 : 0.85)), 0.8);
}

/** Pinnate secondary veins, tapering out toward the edge. */
export const VEINS: string[] = (() => {
  const out: string[] = [];
  for (let x = 30; x <= 250; x += 26) {
    const xu = x + 34;
    const wu = halfWidth(xu, true) * 0.86;
    out.push(`M${x} -1 Q${x + 14} ${(-wu * 0.42).toFixed(1)} ${xu} ${(-wu).toFixed(1)}`);
    const xl = x + 12 + 32;
    const wl = halfWidth(xl, false) * 0.84;
    out.push(`M${x + 12} 1 Q${x + 26} ${(wl * 0.42).toFixed(1)} ${xl} ${wl.toFixed(1)}`);
  }
  return out;
})();

type LeafBladeProps = { idPrefix: string };

/** The blade, veins, sheen and dew drop. Place it with a transform on the parent. */
export function LeafBladeDefs({ idPrefix }: LeafBladeProps) {
  const id = (s: string) => `${idPrefix}-${s}`;
  return (
    <>
      <linearGradient id={id("blade")} x1="0.1" y1="0" x2="0.7" y2="1">
        <stop offset="0" stopColor="#6FA65E" />
        <stop offset="0.45" stopColor="#3F7F48" />
        <stop offset="1" stopColor="#2A5C35" />
      </linearGradient>
      <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="0.5" stopColor="#F4FBE8" stopOpacity="0.5" />
        <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={id("drop")} cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
        <stop offset="0.5" stopColor="#D8EFE6" stopOpacity="0.55" />
        <stop offset="1" stopColor="#7FB59A" stopOpacity="0.7" />
      </radialGradient>
      <clipPath id={id("blade-clip")}>
        <path d={BLADE} />
      </clipPath>
    </>
  );
}

export function LeafBlade({ idPrefix }: LeafBladeProps) {
  const url = (s: string) => `url(#${idPrefix}-${s})`;
  return (
    <>
      <path d={BLADE} fill={url("blade")} />
      <g clipPath={url("blade-clip")}>
        <path
          d="M30 -18 C100 -50 200 -52 280 -10"
          fill="none"
          stroke={url("sheen")}
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path d="M0 0 C68 52 160 60 300 0 V80 H0 Z" fill="#1F4A2A" opacity="0.18" />
      </g>
      <path
        d={BLADE}
        fill="none"
        stroke="#C9DDB8"
        strokeOpacity="0.55"
        strokeWidth="2.4"
      />
      <path d={BLADE} fill="none" stroke="#2A5A33" strokeWidth="1" />
    </>
  );
}

export function LeafVeins() {
  return (
    <g fill="none" strokeLinecap="round">
      {VEINS.map((d) => (
        <path key={d} d={d} stroke="#B9D69A" strokeOpacity="0.75" strokeWidth="1.3" />
      ))}
      <path d={MIDRIB} fill="#D6E8BE" stroke="none" />
    </g>
  );
}

export function DewDrop({ idPrefix }: LeafBladeProps) {
  return (
    <g>
      <ellipse
        cx="104"
        cy="22"
        rx="6.5"
        ry="5.5"
        fill={`url(#${idPrefix}-drop)`}
        stroke="#5E9277"
        strokeOpacity="0.4"
        strokeWidth="0.6"
      />
      <circle cx="102" cy="20" r="1.6" fill="#FFFFFF" />
    </g>
  );
}

export function Twig() {
  return (
    <g strokeLinecap="round" fill="none">
      <path d="M-24 7 C-58 20 -96 40 -138 72" stroke="#6B4A2E" strokeWidth="8" />
      <path
        d="M-26 5 C-60 18 -96 37 -136 68"
        stroke="#9C7651"
        strokeWidth="2"
        opacity="0.8"
      />
      <path d="M0 0 L-24 7" stroke="#6E8F45" strokeWidth="4.5" />
      <path d="M-84 42 C-92 30 -88 20 -80 16" stroke="#6E8F45" strokeWidth="3" />
      <ellipse
        cx="-80"
        cy="15"
        rx="4"
        ry="6"
        fill="#86A85A"
        transform="rotate(30 -80 15)"
      />
    </g>
  );
}
