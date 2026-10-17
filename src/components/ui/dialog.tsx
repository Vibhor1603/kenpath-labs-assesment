"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
};

/** Centered dialog on Base UI. Enters from scale 0.96, exits faster. */
export function Dialog({ open, onOpenChange, children, className }: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="bg-ink/40 fixed inset-0 z-50 transition-opacity duration-300 ease-[var(--ease-out)] data-[ending-style]:opacity-0 data-[ending-style]:duration-200 data-[starting-style]:opacity-0" />
        <DialogPrimitive.Popup
          className={cn(
            "bg-surface fixed top-1/2 left-1/2 z-50 w-[min(340px,calc(100vw-40px))] -translate-x-1/2 -translate-y-1/2 rounded-[28px] p-6 text-center shadow-[var(--shadow-lg)] outline-none",
            "transition-[opacity,scale] duration-[360ms] ease-[var(--spring-ui)] data-[ending-style]:scale-[0.96] data-[ending-style]:opacity-0 data-[ending-style]:duration-200 data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0",
            className,
          )}
        >
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;
