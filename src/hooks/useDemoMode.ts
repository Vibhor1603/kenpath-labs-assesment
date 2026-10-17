"use client";

import { DEMO_STORAGE_KEY } from "@/lib/tokens";
import { useEffect, useState } from "react";

/**
 * Reads ?demo=1 / ?demo=0 from the URL and persists the flag in sessionStorage.
 * Starts false so SSR matches the first client paint, then updates in an effect.
 */
export function useDemoMode(): boolean {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("demo");

    if (flag === "1") {
      try {
        sessionStorage.setItem(DEMO_STORAGE_KEY, "1");
      } catch {
        // ignore
      }
      setIsDemo(true);
      return;
    }
    if (flag === "0") {
      try {
        sessionStorage.removeItem(DEMO_STORAGE_KEY);
      } catch {
        // ignore
      }
      setIsDemo(false);
      return;
    }
    try {
      setIsDemo(sessionStorage.getItem(DEMO_STORAGE_KEY) === "1");
    } catch {
      setIsDemo(false);
    }
  }, []);

  return isDemo;
}
