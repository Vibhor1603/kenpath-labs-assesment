"use client";

import { BadgePin } from "@/components/app/BadgePin";
import { Sheet } from "@/components/ui/sheet";
import { copy } from "@/content/copy";
import type { BadgeId, Progress } from "@/content/types";
import { demoRewardUnits, POINTS_PER_REWARD_UNIT } from "@/lib/rewards";
import { cn } from "@/lib/utils";

const ORDER: BadgeId[] = [
  "first-discovery",
  "perfect-scholar",
  "close-call",
  "return-visitor",
  "streak-3",
  "curious-mind",
];

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "numeric",
      month: "short",
    }).format(new Date(iso));
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
  const units = demoRewardUnits(progress.points);
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={copy.badges.sheetTitle}>
      <div className="bg-brass-tint/70 rounded-[20px] px-4 py-3.5">
        <div className="flex items-end gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-caption text-brass-ink font-semibold tracking-[0.06em] uppercase">
              {copy.reward.pointsLabel}
            </p>
            <p className="tabular font-display text-display text-ink font-semibold">
              {progress.points}
            </p>
          </div>
          <div className="text-right">
            <p className="text-caption text-brass-ink font-semibold tracking-[0.06em] uppercase">
              {copy.wallet.unitsLabel}
            </p>
            <p className="tabular font-display text-title-s text-ink font-semibold">
              {copy.wallet.unitsValue(units)}
            </p>
          </div>
        </div>
        <p className="text-caption text-ink-soft mt-2">
          {copy.wallet.unitsHint(POINTS_PER_REWARD_UNIT)}
        </p>
      </div>

      <div className="ring-line mt-3 rounded-[20px] px-4 py-3 ring-1">
        <p className="text-[15px] leading-5 font-semibold text-ink">
          {copy.wallet.heading}
        </p>
        <p className="text-small text-ink-soft mt-1.5 leading-snug">
          {copy.wallet.about}
        </p>
      </div>

      <p className="tabular text-small text-ink-soft mt-4">
        {earned.size} of {ORDER.length} badges
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-3 pb-2">
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
