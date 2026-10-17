"use client";

import { useEffect, useRef } from "react";

type LiveRegionProps = {
  /** Text to announce. Change this value to trigger an announcement. */
  message: string;
};

/**
 * LiveRegion: an invisible polite aria-live region.
 * Screen readers announce changes to `message` after the current interaction.
 * Used for step changes and quiz results.
 */
export function LiveRegion({ message }: LiveRegionProps) {
  const ref = useRef<HTMLSpanElement>(null);

  // Briefly clear then set text so screen readers re-announce even if the
  // message is the same string as before.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.textContent = "";
    const timer = setTimeout(() => {
      if (ref.current) ref.current.textContent = message;
    }, 50);
    return () => clearTimeout(timer);
  }, [message]);

  return (
    <span
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
