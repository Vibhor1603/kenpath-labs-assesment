"use client";

import { BadgePin } from "@/components/app/BadgePin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { copy } from "@/content/copy";
import type { BadgeId } from "@/content/types";
import { useState } from "react";

type NewBadgeDialogProps = { badge: BadgeId | null; onDone: () => void };

/** Shows one newly earned badge. The pin lands, a brass ring spreads once. */
export function NewBadgeDialog({ badge: incoming, onDone }: NewBadgeDialogProps) {
  // Keep the last badge on screen while the dialog plays its exit.
  const [badge, setBadge] = useState<BadgeId | null>(incoming);
  if (incoming && incoming !== badge) setBadge(incoming);
  return (
    <Dialog open={incoming !== null} onOpenChange={(open) => !open && onDone()}>
      {badge ? (
        <>
          <div className="relative mx-auto size-[112px]" aria-hidden="true">
            <span
              className="ring-brass absolute inset-0 rounded-full ring-2"
              style={{ animation: "arrive-ring 900ms var(--ease-out) 260ms both" }}
            />
            <span className="anim-pop-in block" style={{ animationDelay: "80ms" }}>
              <BadgePin id={badge} earned className="size-[112px]" />
            </span>
          </div>
          <p className="text-caption text-brass-ink mt-5 font-semibold tracking-[0.06em] uppercase">
            {copy.badges.newBadgeTitle}
          </p>
          <DialogTitle className="text-title mt-1">
            {copy.badges.names[badge]}
          </DialogTitle>
          <DialogDescription className="text-small text-ink-soft mt-2">
            {copy.badges.descriptions[badge]}
          </DialogDescription>
          <DialogClose render={<Button className="mt-6 w-full" />}>
            {copy.badges.gotIt}
          </DialogClose>
        </>
      ) : null}
    </Dialog>
  );
}
