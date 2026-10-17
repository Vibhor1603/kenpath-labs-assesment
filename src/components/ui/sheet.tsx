"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Bottom sheet on Base UI Dialog (focus trap, Escape, focus return).
 * Slides with the iOS sheet curve; the overlay is a flat ink tint, no blur.
 */
export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: SheetProps) {
  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Backdrop className="bg-ink/35 fixed inset-0 z-50 transition-opacity duration-300 ease-[var(--ease-out)] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <SheetPrimitive.Popup
          className={cn(
            "bg-surface fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[86dvh] w-full max-w-[430px] flex-col rounded-t-[28px] pb-[max(20px,env(safe-area-inset-bottom))] shadow-[var(--shadow-lg)] outline-none",
            "transition-transform duration-[420ms] ease-[var(--ease-sheet)] data-[ending-style]:translate-y-full data-[ending-style]:duration-[280ms] data-[starting-style]:translate-y-full",
            className,
          )}
        >
          <div className="flex justify-center pt-2.5 pb-1" aria-hidden="true">
            <span className="bg-line-strong h-1 w-10 rounded-full" />
          </div>
          <div className="flex items-start gap-3 px-5 pt-2">
            <div className="min-w-0 flex-1 pt-2">
              <SheetPrimitive.Title className="text-title">{title}</SheetPrimitive.Title>
              {description ? (
                <SheetPrimitive.Description className="text-small text-ink-soft mt-1">
                  {description}
                </SheetPrimitive.Description>
              ) : null}
            </div>
            <SheetPrimitive.Close
              className="pressable text-ink-soft hover:bg-sunk/70 hover:text-ink -mr-2 inline-flex size-12 items-center justify-center rounded-full"
              aria-label="Close"
            >
              <X className="size-[22px]" aria-hidden="true" />
            </SheetPrimitive.Close>
          </div>
          <div className="scroll-area min-h-0 flex-1 px-5 pt-4">{children}</div>
        </SheetPrimitive.Popup>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}
