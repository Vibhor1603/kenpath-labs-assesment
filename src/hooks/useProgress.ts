"use client";

import type { BadgeId, DiscoveryId, Progress, TestOutcome } from "@/content/types";
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
import { STORAGE_KEY } from "@/lib/tokens";
import { useCallback, useEffect, useReducer, useRef } from "react";

type UseProgressReturn = {
  progress: Progress;
  dispatch: (action: ProgressAction) => void;
  finishTest: (discoveryId: DiscoveryId, score: number) => TestOutcome;
};

let adapterSingleton: StorageAdapter | null = null;

function getAdapter(): StorageAdapter {
  if (!adapterSingleton) adapterSingleton = createStorageAdapter();
  return adapterSingleton;
}

/**
 * Progress store. Starts with a deterministic fresh state so SSR and the first
 * client render match, then loads from storage in an effect (boot script
 * already set data-returning to avoid a flash).
 */
export function useProgress(): UseProgressReturn {
  const todayKey = toDateKey(new Date());
  const saverRef = useRef<ReturnType<typeof createDebouncedSaver> | null>(null);
  const [progress, dispatch] = useReducer(
    progressReducer,
    todayKey,
    createFreshProgress,
  );
  const hydratedRef = useRef(false);

  useEffect(() => {
    const adapter = getAdapter();
    saverRef.current = createDebouncedSaver(adapter, 100);
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const raw = adapter.getItem(STORAGE_KEY);
    const { progress: loaded } = parseProgress(raw, todayKey);
    dispatch({ type: "adoptSnapshot", snapshot: loaded, todayKey });
  }, [todayKey]);

  useEffect(() => {
    dispatch({ type: "boot", todayKey });
  }, [todayKey]);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saverRef.current?.save(progress);
  }, [progress]);

  useEffect(() => {
    const onPageHide = () => saverRef.current?.flush(progress);
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [progress]);

  const finishTest = useCallback(
    (discoveryId: DiscoveryId, score: number): TestOutcome => {
      const nowIso = new Date().toISOString();
      const before = progress;
      const action: ProgressAction = {
        type: "finishTest",
        discoveryId,
        score,
        todayKey,
        nowIso,
      };
      dispatch(action);
      const after = progressReducer(before, action);
      return getTestOutcome(before, after, discoveryId);
    },
    [progress, todayKey],
  );

  void (null as BadgeId | null);

  return { progress, dispatch, finishTest };
}
