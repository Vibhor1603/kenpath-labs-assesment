import { Sprout } from "@/components/app/Sprout";
import { copy } from "@/content/copy";

const pill =
  "inline-flex h-8 items-center gap-1 rounded-full bg-surface/90 pr-2.5 text-[13px] font-semibold text-ink ring-1 ring-line/80 ring-inset";

type PointsPillProps = { points: number; onPress: () => void; unseen: boolean };

/** Kenpath Points. Opens the badge sheet. */
export function PointsPill({ points, onPress, unseen }: PointsPillProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`pressable ${pill} relative pl-1`}
      aria-label={`${points} Kenpath Points. Open points and badges`}
    >
      <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#C8963F" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="#8A5F17" strokeOpacity="0.5" />
        <circle cx="12" cy="12" r="6.6" fill="none" stroke="#F3D58D" strokeWidth="1.3" />
        <path
          d="M12 8.6 L13.1 10.9 L15.6 11.2 L13.8 12.9 L14.2 15.4 L12 14.2 L9.8 15.4 L10.2 12.9 L8.4 11.2 L10.9 10.9 Z"
          fill="#FBF3E2"
        />
      </svg>
      <span className="tabular leading-none">{points}</span>
      {unseen ? (
        <span
          className="bg-wrong ring-canvas absolute -top-0.5 -right-0.5 size-2.5 rounded-full ring-2"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

/** Daily streak: compact single-line “Streak 2d” so it stays clear and light. */
export function StreakPill({ count }: { count: number }) {
  const short = count === 1 ? "1d" : `${count}d`;
  return (
    <span
      className={`${pill} gap-1 pr-2.5 pl-1`}
      role="img"
      aria-label={`${copy.home.streakLabel}: ${copy.home.streakDays(count)}`}
      title={`${copy.home.streakLabel}: ${copy.home.streakDays(count)} in a row`}
    >
      <Sprout count={count} className="size-5" />
      <span className="flex items-baseline gap-1 leading-none" aria-hidden="true">
        <span className="text-ink-soft text-[10px] font-semibold tracking-[0.06em] uppercase">
          {copy.home.streakLabel}
        </span>
        <span className="tabular text-[13px]">{short}</span>
      </span>
    </span>
  );
}
