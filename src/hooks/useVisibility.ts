"use client";

import { useEffect, useState } from "react";

/**
 * Tracks document.visibilityState.
 * Returns true when the page is visible.
 * Use this to pause loops and ambient animations when the tab is hidden.
 */
export function useVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof document === "undefined") return true;
    return document.visibilityState === "visible";
  });

  useEffect(() => {
    const update = () => {
      setIsVisible(document.visibilityState === "visible");
    };
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return isVisible;
}
