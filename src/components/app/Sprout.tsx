import { cn } from "@/lib/utils";

type SproutProps = { count: number; className?: string; grow?: boolean };

const LEAVES = [
  {
    d: "M12 15.2 C9.4 15.4 7.4 14 6.6 11.6 C9.2 11.2 11.2 12.6 12 15.2 Z",
    origin: "100% 100%",
  },
  {
    d: "M12 12.6 C14.6 12.8 16.6 11.4 17.4 9 C14.8 8.6 12.8 10 12 12.6 Z",
    origin: "0% 100%",
  },
  { d: "M12 10 C10.2 9.4 9.4 7.6 9.8 5.6 C11.6 6.2 12.4 8 12 10 Z", origin: "100% 100%" },
];

/** Streak sprout: a glazed pot, one leaf per streak day up to 3, and a flower at 3 or more. */
export function Sprout({ count, className, grow = false }: SproutProps) {
  const leaves = Math.min(3, Math.max(0, count));
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true">
      <path
        d="M12 18 V9.4"
        stroke="#386B43"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
        opacity={leaves > 0 ? 1 : 0.45}
      />
      {LEAVES.map((leaf, i) => (
        <path
          key={i}
          d={leaf.d}
          fill={i === 1 ? "#4F8A55" : "#3E7D4A"}
          className={cn(grow && i === leaves - 1 && "anim-pop-in")}
          style={{
            opacity: i < leaves ? 1 : 0,
            transformBox: "fill-box",
            transformOrigin: leaf.origin,
          }}
        />
      ))}
      {count >= 3 ? (
        <g
          className={cn(grow && "anim-pop-in")}
          style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
        >
          <circle cx="12" cy="5.6" r="2" fill="#F2D27A" />
          <circle cx="12" cy="5.6" r="0.8" fill="#B5832F" />
        </g>
      ) : null}
      <path
        d="M7.4 17.6 H16.6 L15.6 22 Q15.5 22.6 14.9 22.6 H9.1 Q8.5 22.6 8.4 22 Z"
        fill="#C9744B"
      />
      <path d="M7 16.6 H17 V18 H7 Z" fill="#B0603A" />
      <path
        d="M8.4 18.4 L9 21.6"
        stroke="#E39B74"
        strokeWidth="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
