"use client";

import { copy } from "@/content/copy";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Shows a Sonner toast once when the browser goes offline.
 * Nothing happens when it comes back online (the app keeps working).
 */
export function useOnlineToast(): void {
  const shownRef = useRef(false);

  useEffect(() => {
    const handleOffline = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      toast(copy.offline.toast, { duration: 5000 });
    };

    const handleOnline = () => {
      // Reset so offline is announced again if it happens later
      shownRef.current = false;
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Show immediately if already offline on mount
    if (!navigator.onLine) handleOffline();

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);
}
