"use client";

import { copy } from "@/content/copy";
import type { BadgeId } from "@/content/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useRef } from "react";

type NewBadgeDialogProps = {
  badgeId: BadgeId | null;
  onClose: () => void;
};

const BADGE_ICONS: Record<BadgeId, string> = {
  "first-discovery": "🌟",
  "perfect-scholar": "📚",
  "streak-3": "🌱",
  "curious-mind": "🔭",
};

/**
 * NewBadgeDialog: shown once after the reward moment when a new badge is earned.
 * Short, skippable, focus returns to primary button on close.
 */
export function NewBadgeDialog({ badgeId, onClose }: NewBadgeDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (badgeId) closeRef.current?.focus();
  }, [badgeId]);

  if (!badgeId) return null;

  const name = copy.badges.names[badgeId];
  const icon = BADGE_ICONS[badgeId];

  return (
    <Dialog open={!!badgeId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="mx-auto max-w-[320px] rounded-[24px] border-border/50 bg-background p-6 text-center">
        <DialogHeader>
          <DialogTitle className="sr-only">{copy.badges.newBadgeTitle}</DialogTitle>
        </DialogHeader>

        {/* Badge icon */}
        <div className="mb-4 flex justify-center text-[48px]">
          {icon}
        </div>

        <p className="text-[13px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
          {copy.badges.newBadgeTitle}
        </p>

        <h2 className="font-display text-[24px] font-[600] text-foreground mb-2">
          {name}
        </h2>

        <p className="text-[15px] text-muted-foreground mb-6">
          {getBadgeDescription(badgeId)}
        </p>

        <button
          ref={closeRef}
          onClick={onClose}
          className="flex h-12 w-full items-center justify-center rounded-full bg-primary text-[17px] font-medium text-primary-foreground active:scale-[0.97] transition-transform"
        >
          Great
        </button>
      </DialogContent>
    </Dialog>
  );
}

function getBadgeDescription(id: BadgeId): string {
  switch (id) {
    case "first-discovery": return "You completed your first discovery.";
    case "perfect-scholar": return "You passed on your first try.";
    case "streak-3": return "Three days in a row. Keep going.";
    case "curious-mind": return "You understand all three discoveries.";
  }
}
