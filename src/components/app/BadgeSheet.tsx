"use client";

import { copy } from "@/content/copy";
import type { Badge, BadgeId } from "@/content/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type BadgeSheetProps = {
  open: boolean;
  onClose: () => void;
  badges: Badge[];
};

const ALL_BADGES: BadgeId[] = [
  "first-discovery",
  "perfect-scholar",
  "streak-3",
  "curious-mind",
];

const BADGE_ICONS: Record<BadgeId, string> = {
  "first-discovery": "★",
  "perfect-scholar": "◆",
  "streak-3": "▲",
  "curious-mind": "●",
};

const BADGE_DESC: Record<BadgeId, string> = {
  "first-discovery": "Complete your first discovery.",
  "perfect-scholar": "Pass on your first try.",
  "streak-3": "Three days in a row.",
  "curious-mind": "Understand all three discoveries.",
};

/**
 * BadgeSheet: bottom sheet listing all 4 badges, earned or locked.
 * Enamel pin grid style. Earned badges show the date.
 */
export function BadgeSheet({ open, onClose, badges }: BadgeSheetProps) {
  const earnedIds = new Set(badges.map((b) => b.id));

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-[24px] border-t-0 bg-background px-0 pt-0 pb-safe"
      >
        <div className="px-5 pt-4 pb-6">
          <SheetHeader className="mb-4">
            <SheetTitle className="font-display text-[20px] font-[600] text-foreground">
              Badges
            </SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-3">
            {ALL_BADGES.map((id) => {
              const earned = earnedIds.has(id);
              const badge = badges.find((b) => b.id === id);
              const earnedDate = badge
                ? new Date(badge.earnedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })
                : null;

              return (
                <div
                  key={id}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-[16px] border p-4 text-center",
                    earned
                      ? "border-border/50 bg-card"
                      : "border-border/20 bg-muted/20 opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full text-[24px]",
                      earned ? "bg-primary/10" : "bg-muted/30",
                    )}
                  >
                    {BADGE_ICONS[id]}
                  </div>
                  <p className="text-[13px] font-[600] text-foreground leading-snug">
                    {copy.badges.names[id]}
                  </p>
                  <p className="text-[12px] text-muted-foreground leading-snug">
                    {BADGE_DESC[id]}
                  </p>
                  {earnedDate && (
                    <p className="text-[11px] text-muted-foreground">
                      Earned {earnedDate}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
