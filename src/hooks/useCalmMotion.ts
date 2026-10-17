"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when calm motion is active.
 * Calm = user's OS prefers-reduced-motion setting OR the in-app "Calm motion" switch.
 * The boot script sets data-calm on <html> before first paint if the saved
 * setting is true, so the initial value can be read synchronously.
 */
export function useCalmMotion(calmSetting: boolean): boolean {
  const [isCalm, setIsCalm] = useState(() => {
    if (typeof document === "undefined") return false;
    // Boot script may have already set data-calm
    if (document.documentElement.hasAttribute("data-calm")) return true;
    // Check OS preference synchronously on first render
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  // React to OS preference changes
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setIsCalm(mq.matches || calmSetting);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [calmSetting]);

  // Sync data-calm attribute so CSS can react to it
  useEffect(() => {
    const calm = isCalm || calmSetting;
    if (calm) {
      document.documentElement.setAttribute("data-calm", "");
    } else {
      document.documentElement.removeAttribute("data-calm");
    }
  }, [isCalm, calmSetting]);

  return isCalm || calmSetting;
}
