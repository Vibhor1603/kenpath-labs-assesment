import type { Progress } from "@/content/types";
import { createFreshProgress } from "@/lib/progress";
import { STORAGE_KEY } from "@/lib/tokens";

export type StorageAdapter = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  isPersistent: boolean;
};

export function createStorageAdapter(): StorageAdapter {
  try {
    const probe = "__kenpath_probe__";
    window.localStorage.setItem(probe, "1");
    window.localStorage.removeItem(probe);
    return {
      getItem: (k) => window.localStorage.getItem(k),
      setItem: (k, v) => window.localStorage.setItem(k, v),
      removeItem: (k) => window.localStorage.removeItem(k),
      isPersistent: true,
    };
  } catch {
    const map = new Map<string, string>();
    return {
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => {
        map.set(k, v);
      },
      removeItem: (k) => {
        map.delete(k);
      },
      isPersistent: false,
    };
  }
}

export function isProgressShape(value: unknown): value is Progress {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (v.version !== 1) return false;
  if (typeof v.firstVisitDate !== "string") return false;
  if (![1, 2, 3].includes(v.maxUnlockedDay as number)) return false;
  if (typeof v.points !== "number") return false;
  if (!v.streak || typeof v.streak !== "object") return false;
  const streak = v.streak as Record<string, unknown>;
  if (typeof streak.count !== "number") return false;
  if (streak.lastPerfectDate !== null && typeof streak.lastPerfectDate !== "string")
    return false;
  if (!v.attempts || typeof v.attempts !== "object") return false;
  if (!v.collected || typeof v.collected !== "object") return false;
  if (!Array.isArray(v.badges)) return false;
  if (!Array.isArray(v.seenBadges)) return false;
  if (!v.settings || typeof v.settings !== "object") return false;
  return true;
}

export type ParseStatus = "fresh" | "loaded" | "recovered";

export function parseProgress(
  raw: string | null,
  todayKey: string,
): { progress: Progress; status: ParseStatus } {
  if (!raw) {
    return { progress: createFreshProgress(todayKey), status: "fresh" };
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isProgressShape(parsed)) {
      return { progress: createFreshProgress(todayKey), status: "recovered" };
    }
    const progress: Progress = {
      ...parsed,
      introDismissed: Boolean(
        (parsed as Progress).introDismissed ?? false,
      ),
      settings: {
        haptics: parsed.settings?.haptics ?? true,
        calmMotion: parsed.settings?.calmMotion ?? false,
      },
    };
    return { progress, status: "loaded" };
  } catch {
    return { progress: createFreshProgress(todayKey), status: "recovered" };
  }
}

export function createDebouncedSaver(
  adapter: StorageAdapter,
  delayMs = 100,
): { save: (progress: Progress) => void; flush: (progress: Progress) => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: Progress | null = null;

  const write = (progress: Progress) => {
    try {
      adapter.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // private mode already fell back; ignore write failures
    }
  };

  return {
    save: (progress) => {
      pending = progress;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (pending) write(pending);
        pending = null;
        timer = null;
      }, delayMs);
    },
    flush: (progress) => {
      if (timer) clearTimeout(timer);
      timer = null;
      pending = null;
      write(progress);
    },
  };
}

export { STORAGE_KEY };
