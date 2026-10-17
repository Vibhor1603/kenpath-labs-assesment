import { Sprout } from "@/components/app/Sprout";

const pill =
  "pressable inline-flex h-10 items-center gap-1.5 rounded-full bg-surface pr-3.5 text-[15px] font-semibold text-ink ring-1 ring-line ring-inset";

type PointsPillProps = { points: number; onPress: () => void; unseen: boolean };

/** Kenpath Points. Opens the badge sheet. */
export function PointsPill({ points, onPress, unseen }: PointsPillProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={`${pill} relative pl-1.5`}
      aria-label={`${points} Kenpath Points. Open badges`}
    >
      <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#C8963F" />
        <circle cx="12" cy="12" r="10" fill="none" stroke="#8A5F17" strokeOpacity="0.5" />
        <circle cx="12" cy="12" r="6.6" fill="none" stroke="#F3D58D" strokeWidth="1.3" />
        <path
          d="M12 8.6 L13.1 10.9 L15.6 11.2 L13.8 12.9 L14.2 15.4 L12 14.2 L9.8 15.4 L10.2 12.9 L8.4 11.2 L10.9 10.9 Z"
          fill="#FBF3E2"
        />
      </svg>
      <span className="tabular">{points}</span>
      {unseen ? (
        <span
          className="bg-wrong ring-canvas absolute -top-0.5 -right-0.5 size-3 rounded-full ring-2"
          aria-hidden="true"
        />
      ) : null}
    </button>
  );
}

/** Streak count with the sprout. Not a button: there is nothing to open. */
export function StreakPill({ count }: { count: number }) {
  return (
    <span
      className="bg-surface text-ink ring-line inline-flex h-10 items-center gap-1 rounded-full pr-3.5 pl-2 text-[15px] font-semibold ring-1 ring-inset"
      role="img"
      aria-label={count === 1 ? "Streak: 1 day" : `Streak: ${count} days`}
    >
      <Sprout count={count} />
      <span className="tabular" aria-hidden="true">
        {count}
      </span>
    </span>
  );
}
