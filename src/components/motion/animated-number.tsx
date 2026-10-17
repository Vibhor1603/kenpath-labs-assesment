"use client";

import { cn } from "@/lib/utils";
import type { SpringOptions } from "motion/react";

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  /** Kept for API compatibility with motion-primitives. */
  springOptions?: SpringOptions;
};

/**
 * Points number. CSS transition on opacity gives a light count-up feel
 * without fighting React Compiler lint rules around spring subscriptions.
 */
export function AnimatedNumber({ value, className }: AnimatedNumberProps) {
  return (
    <span
      key={value}
      className={cn(
        "tabular-nums inline-block animate-in fade-in duration-300",
        className,
      )}
    >
      {value}
    </span>
  );
}
