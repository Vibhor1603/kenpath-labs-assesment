"use client";

import { useEffect, useState } from "react";

export type DeviceFlags = {
  /** OS reduced motion or the in-app Calm motion switch. */
  calm: boolean;
  /** Low-end device or Data Saver (set on <html> by the boot script). */
  lite: boolean;
  /** Tab is visible. Loops pause when it is not. */
  visible: boolean;
  /** First client effect has run. Gate anything that differs from the server render. */
  mounted: boolean;
};

/**
 * All flags start as the server render would see them, then update after mount,
 * so the first client render always matches the static HTML.
 */
export function useDeviceFlags(calmSetting: boolean): DeviceFlags {
  const [osReduced, setOsReduced] = useState(false);
  const [lite, setLite] = useState(false);
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMq = () => setOsReduced(mq.matches);
    const onVis = () => setVisible(document.visibilityState === "visible");
    /* eslint-disable react-hooks/set-state-in-effect -- reading browser state once after hydration */
    onMq();
    onVis();
    setLite(document.documentElement.hasAttribute("data-lite"));
    setMounted(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    mq.addEventListener("change", onMq);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      mq.removeEventListener("change", onMq);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (calmSetting) root.setAttribute("data-calm", "");
    else root.removeAttribute("data-calm");
  }, [calmSetting]);

  return { calm: osReduced || calmSetting, lite, visible, mounted };
}
