"use client";

import { copy } from "@/content/copy";
import { toast } from "@/lib/toast";
import { useEffect } from "react";

/** One toast when the browser goes offline. The app keeps working: everything is static. */
export function useOnlineToast(): void {
  useEffect(() => {
    let shown = false;
    const onOffline = () => {
      if (shown) return;
      shown = true;
      toast(copy.offline.toast);
    };
    const onOnline = () => {
      shown = false;
    };
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    if (!navigator.onLine) onOffline();
    return () => {
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
    };
  }, []);
}
