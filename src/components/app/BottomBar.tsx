"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BottomBarProps = {
  /** Slot for the full-width primary button. */
  primaryAction: ReactNode;
  /** Optional secondary actions (icon buttons) beside the primary. */
  secondaryAction?: ReactNode;
  className?: string;
};

/**
 * BottomBar: 72px + safe-area-inset-bottom.
 * Holds the primary action button and optional secondary actions.
 * Primary button should be 56px tall and fill the available width.
 */
export function BottomBar({
  primaryAction,
  secondaryAction,
  className,
}: BottomBarProps) {
  return (
    <footer
      className={cn(
        "flex w-full items-end gap-3 px-4",
        "h-[calc(72px+env(safe-area-inset-bottom))]",
        "pb-[max(16px,env(safe-area-inset-bottom))]",
        "bg-background border-t border-border/40",
        className,
      )}
      aria-label="Primary actions"
    >
      {secondaryAction && (
        <div className="shrink-0">{secondaryAction}</div>
      )}
      <div className="flex flex-1">{primaryAction}</div>
    </footer>
  );
}
