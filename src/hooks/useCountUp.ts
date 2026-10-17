"use client";

import { useEffect, useRef } from "react";

/**
 * Counts a number up by writing textContent directly, so React does not
 * re-render 60 times a second. Instant when `instant` is true.
 */
export function useCountUp<T extends HTMLElement>(
  to: number,
  { from = 0, delayMs = 0, durationMs = 650, instant = false, prefix = "" } = {},
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = (n: number) => {
      el.textContent = `${prefix}${Math.round(n)}`;
    };
    if (instant || to === from) {
      write(to);
      return;
    }
    write(from);
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      write(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [to, from, delayMs, durationMs, instant, prefix]);

  return ref;
}
