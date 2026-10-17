import { cn } from "@/lib/utils";

type ScoreFiresProps = {
  score: number;
  total?: number;
  className?: string;
  size?: "sm" | "md";
};

/**
 * Shows quiz results as fire marks (lit = correct). Used on Home and Result.
 * Emoji are kept for the assessment ask; lite devices still render them as text.
 */
export function ScoreFires({
  score,
  total = 5,
  className,
  size = "md",
}: ScoreFiresProps) {
  const safe = Math.max(0, Math.min(total, Math.floor(score)));
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 tabular",
        size === "sm" ? "text-[13px] leading-none" : "text-[18px] leading-none",
        className,
      )}
      role="img"
      aria-label={`${safe} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={i < safe ? "opacity-100" : "opacity-25 grayscale"}
          aria-hidden="true"
        >
          🔥
        </span>
      ))}
    </span>
  );
}
