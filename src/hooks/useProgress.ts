"use client";

import { copy } from "@/content/copy";
import type { DiscoveryId, Progress, TestOutcome } from "@/content/types";
import { toDateKey } from "@/lib/date";
import {
  createFreshProgress,
  getTestOutcome,
  progressReducer,
  type ProgressAction,
} from "@/lib/progress";
import {
  createDebouncedSaver,
  createStorageAdapter,
  parseProgress,
  type StorageAdapter,
} from "@/lib/storage";
import { toast } from "@/lib/toast";
import { STORAGE_KEY } from "@/lib/tokens";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

type UseProgressReturn = {
  progress: Progress;
  /** Saved progress has been read. Until then the UI shows the fresh state. */
  hydrated: boolean;
  dispatch: (action: ProgressAction) => void;
  finishTest: (discoveryId: DiscoveryId, score: number) => TestOutcome;
};

let adapterSingleton: StorageAdapter | null = null;

function getAdapter(): StorageAdapter {
  if (!adapterSingleton) adapterSingleton = createStorageAdapter();
  return adapterSingleton;
}

/**
 * Progress store. Starts with a deterministic fresh state so the static HTML
 * and the first client render match, then adopts saved progress in an effect.
 * The frame stays hidden for returning visitors until then (see the boot script).
 */
export function useProgress(): UseProgressReturn {
  const todayKey = toDateKey(new Date());
  const saverRef = useRef<ReturnType<typeof createDebouncedSaver> | null>(null);
  const [progress, dispatch] = useReducer(progressReducer, todayKey, createFreshProgress);
  const [hydrated, setHydrated] = useState(false);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const adapter = getAdapter();
    saverRef.current = createDebouncedSaver(adapter, 100);
    const { progress: loaded } = parseProgress(adapter.getItem(STORAGE_KEY), todayKey);
    dispatch({ type: "adoptSnapshot", snapshot: loaded, todayKey });
    dispatch({ type: "boot", todayKey });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks the one-time storage read
    setHydrated(true);
    if (!adapter.isPersistent) toast(copy.storage.toast);
    const onPageHide = () => saverRef.current?.flush(progressRef.current);
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [todayKey]);

  useEffect(() => {
    if (hydrated) saverRef.current?.save(progress);
  }, [progress, hydrated]);

  const finishTest = useCallback(
    (discoveryId: DiscoveryId, score: number): TestOutcome => {
      const before = progressRef.current;
      const action: ProgressAction = {
        type: "finishTest",
        discoveryId,
        score,
        todayKey,
        nowIso: new Date().toISOString(),
      };
      const after = progressReducer(before, action);
      progressRef.current = after;
      dispatch(action);
      return getTestOutcome(before, after, discoveryId);
    },
    [todayKey],
  );

  return { progress, hydrated, dispatch, finishTest };
}
