"use client";

import { DEMO_STORAGE_KEY } from "@/lib/tokens";
import { useEffect, useState } from "react";

function readDemoFlag(): boolean {
  const flag = new URLSearchParams(window.location.search).get("demo");
  try {
    if (flag === "1") sessionStorage.setItem(DEMO_STORAGE_KEY, "1");
    if (flag === "0") sessionStorage.removeItem(DEMO_STORAGE_KEY);
    if (flag === "1" || flag === "0") return flag === "1";
    return sessionStorage.getItem(DEMO_STORAGE_KEY) === "1";
  } catch {
    return flag === "1";
  }
}

/**
 * ?demo=1 unlocks all three discoveries for this tab (sessionStorage); ?demo=0 clears it.
 * Starts false so the static HTML matches the first client render.
 */
export function useDemoMode(): boolean {
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the URL once after hydration
    setIsDemo(readDemoFlag());
  }, []);
  return isDemo;
}
