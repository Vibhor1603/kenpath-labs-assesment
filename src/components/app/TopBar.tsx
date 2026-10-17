import { copy } from "@/content/copy";
import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";

const bar =
  "relative z-20 flex min-h-[calc(56px+env(safe-area-inset-top))] shrink-0 items-center gap-2.5 px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))] pt-[calc(10px+env(safe-area-inset-top))] pb-2.5";

type HomeTopBarProps = {
  right: ReactNode;
  onMenu?: () => void;
};

export function HomeTopBar({ right, onMenu }: HomeTopBarProps) {
  return (
    <header className={bar} style={{ viewTransitionName: "topbar" }}>
      {onMenu ? (
        <button
          type="button"
          onClick={onMenu}
          aria-label={copy.menu.openMenu}
          className="pressable text-ink hover:bg-sunk/70 -ml-1 inline-flex size-11 shrink-0 items-center justify-center rounded-full"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <span className="font-display text-ink text-[18px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap">
          {copy.app.wordmark}
        </span>
        <span className="text-caption text-ink-soft truncate leading-none">
          {copy.app.tagline}
        </span>
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </header>
  );
}

type FlowTopBarProps = {
  current: number;
  total: number;
  onClose: () => void;
  closeLabel: string;
  /** Segments that are complete. Defaults to everything before `current`. */
  done?: number;
};

/** Close, segmented progress and an "n of N" counter. Segments fill with scaleX, never width. */
export function FlowTopBar({
  current,
  total,
  onClose,
  closeLabel,
  done,
}: FlowTopBarProps) {
  const filled = done ?? current;
  return (
    <header className={bar} style={{ viewTransitionName: "topbar" }}>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="pressable text-ink hover:bg-sunk/70 inline-flex size-12 items-center justify-center rounded-full"
      >
        <X className="size-[22px]" aria-hidden="true" />
      </button>
      <div
        className="flex flex-1 items-center gap-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
        aria-label="Progress"
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="bg-line relative h-1.5 flex-1 overflow-hidden rounded-full"
          >
            <span
              className="bg-ink absolute inset-0 origin-left rounded-full transition-transform duration-500 ease-[var(--spring-soft)]"
              style={{ transform: `scaleX(${i < filled ? 1 : 0})` }}
            />
          </span>
        ))}
      </div>
      <span
        className="tabular text-ink-soft w-12 text-center text-[15px] font-semibold"
        aria-hidden="true"
      >
        {Math.min(current, total)}/{total}
      </span>
    </header>
  );
}
