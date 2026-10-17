"use client";

import { copy } from "@/content/copy";
import type { DiscoveryId, Progress, TestOutcome } from "@/content/types";
import {
  accountStorageKey,
  mergeProgress,
} from "@/lib/accountProgress";
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
  /**
   * Bind the current (guest) museum to an account: merge any saved account
   * progress, keep phone work, and mirror saves to that account key.
   */
  attachAccount: (username: string, opts?: { silent?: boolean }) => void;
  /** Flush current progress onto the account key, then stop mirroring. */
  detachAccount: () => void;
};

let adapterSingleton: StorageAdapter | null = null;

function getAdapter(): StorageAdapter {
  if (!adapterSingleton) adapterSingleton = createStorageAdapter();
  return adapterSingleton;
}

export function useProgress(): UseProgressReturn {
  const todayKey = toDateKey(new Date());
  const saverRef = useRef<ReturnType<typeof createDebouncedSaver> | null>(null);
  const accountRef = useRef<string | null>(null);
  const [progress, dispatch] = useReducer(progressReducer, todayKey, createFreshProgress);
  const [hydrated, setHydrated] = useState(false);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const writeAccountMirror = useCallback((next: Progress) => {
    const user = accountRef.current;
    if (!user) return;
    try {
      getAdapter().setItem(accountStorageKey(user), JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const adapter = getAdapter();
    saverRef.current = createDebouncedSaver(adapter, 100);
    const { progress: loaded } = parseProgress(adapter.getItem(STORAGE_KEY), todayKey);
    dispatch({ type: "adoptSnapshot", snapshot: loaded, todayKey });
    dispatch({ type: "boot", todayKey });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- marks the one-time storage read
    setHydrated(true);
    if (!adapter.isPersistent) toast(copy.storage.toast);
    const onPageHide = () => {
      saverRef.current?.flush(progressRef.current);
      writeAccountMirror(progressRef.current);
    };
    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [todayKey, writeAccountMirror]);

  useEffect(() => {
    if (!hydrated) return;
    saverRef.current?.save(progress);
    writeAccountMirror(progress);
  }, [progress, hydrated, writeAccountMirror]);

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
      return getTestOutcome(before, after, discoveryId, score);
    },
    [todayKey],
  );

  const attachAccount = useCallback(
    (username: string, opts?: { silent?: boolean }) => {
      const key = username.trim().toLowerCase();
      const adapter = getAdapter();
      const guest = progressRef.current;
      const alreadyBound = accountRef.current === key;
      const raw = adapter.getItem(accountStorageKey(key));
      const account = raw ? parseProgress(raw, todayKey).progress : null;
      const merged = account ? mergeProgress(guest, account) : guest;
      accountRef.current = key;
      try {
        adapter.setItem(STORAGE_KEY, JSON.stringify(merged));
        adapter.setItem(accountStorageKey(key), JSON.stringify(merged));
      } catch {
        // ignore
      }
      progressRef.current = merged;
      dispatch({ type: "adoptSnapshot", snapshot: merged, todayKey });
      if (!opts?.silent && !alreadyBound) toast(copy.auth.progressSaved);
    },
    [todayKey],
  );

  const detachAccount = useCallback(() => {
    const user = accountRef.current;
    if (user) {
      try {
        getAdapter().setItem(accountStorageKey(user), JSON.stringify(progressRef.current));
      } catch {
        // ignore
      }
    }
    accountRef.current = null;
  }, []);

  return {
    progress,
    hydrated,
    dispatch,
    finishTest,
    attachAccount,
    detachAccount,
  };
}
