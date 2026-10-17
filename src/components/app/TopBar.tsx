import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const bar =
  "relative z-20 flex h-[calc(56px+env(safe-area-inset-top))] shrink-0 items-center gap-2 px-[max(12px,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)]";

type HomeTopBarProps = { right: ReactNode };

export function HomeTopBar({ right }: HomeTopBarProps) {
  return (
    <header
      className={cn(bar, "pl-[max(20px,env(safe-area-inset-left))]")}
      style={{ viewTransitionName: "topbar" }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="font-display text-ink text-[20px] leading-none font-semibold tracking-[-0.02em] whitespace-nowrap">
          How Things Work
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
