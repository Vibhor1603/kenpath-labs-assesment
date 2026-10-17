"use client";

import { BadgePin } from "@/components/app/BadgePin";
import { Sheet } from "@/components/ui/sheet";
import { copy } from "@/content/copy";
import type { BadgeId, Progress } from "@/content/types";
import { cn } from "@/lib/utils";

const ORDER: BadgeId[] = [
  "first-discovery",
  "perfect-scholar",
  "streak-3",
  "curious-mind",
];

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(
      new Date(iso),
    );
  } catch {
    return iso.slice(0, 10);
  }
}

type BadgeSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: Progress;
};

export function BadgeSheet({ open, onOpenChange, progress }: BadgeSheetProps) {
  const earned = new Map(progress.badges.map((b) => [b.id, b.earnedAt]));
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={copy.badges.sheetTitle}>
      <div className="bg-brass-tint/70 flex items-center gap-4 rounded-[20px] px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-caption text-brass-ink font-semibold tracking-[0.06em] uppercase">
            {copy.reward.pointsLabel}
          </p>
          <p className="tabular font-display text-display text-ink font-semibold">
            {progress.points}
          </p>
        </div>
        <p className="tabular text-small text-ink-soft">{earned.size} of 4 badges</p>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-3 pb-2">
        {ORDER.map((id) => {
          const at = earned.get(id);
          return (
            <li
              key={id}
              className={cn(
                "ring-line flex flex-col items-center rounded-[20px] px-3 pt-4 pb-4 text-center ring-1",
                at ? "bg-surface" : "bg-canvas",
              )}
            >
              <BadgePin id={id} earned={Boolean(at)} className="size-16" />
              <p
                className={cn(
                  "mt-2.5 text-[15px] leading-5 font-semibold",
                  at ? "text-ink" : "text-ink-soft",
                )}
              >
                {copy.badges.names[id]}
              </p>
              <p className="text-caption text-ink-soft mt-1">
                {copy.badges.descriptions[id]}
              </p>
              <p
                className={cn(
                  "text-caption mt-2 font-semibold",
                  at ? "text-brass-ink" : "text-ink-soft",
                )}
              >
                {at ? copy.badges.earnedOn(formatDate(at)) : copy.badges.notYet}
              </p>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
