"use client";

import type { DiscoveryId } from "@/content/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type ViewName = "home" | "lesson" | "test" | "result" | "reward";

export type ViewState =
  | { name: "home" }
  | { name: "lesson"; discoveryId: DiscoveryId; step: number }
  | { name: "test"; discoveryId: DiscoveryId }
  | { name: "result"; discoveryId: DiscoveryId }
  | { name: "reward"; discoveryId: DiscoveryId };

const IDS: readonly DiscoveryId[] = ["fridge", "leaf", "heart"];

export function parseViewFromSearch(search: string): ViewState {
  const params = new URLSearchParams(search);
  const view = params.get("view");
  const raw = params.get("d");
  const d = IDS.find((id) => id === raw);
  if (!d) return { name: "home" };
  if (view === "lesson") {
    const step = Math.max(1, parseInt(params.get("step") ?? "1", 10) || 1);
    return { name: "lesson", discoveryId: d, step };
  }
  if (view === "test" || view === "result" || view === "reward")
    return { name: view, discoveryId: d };
  return { name: "home" };
}

export function buildURL(view: ViewState): string {
  if (view.name === "home") return "/";
  const params = new URLSearchParams({ view: view.name, d: view.discoveryId });
  if (view.name === "lesson") params.set("step", String(view.step));
  return `/?${params.toString()}`;
}

export type UseViewReturn = {
  view: ViewState;
  /** Pushes a history entry, so Android back returns here. */
  push: (next: ViewState) => void;
  /** Replaces the current entry (step changes, test to result). */
  replace: (next: ViewState) => void;
  /** Returns to Home and drops the flow entries from history. */
  home: () => void;
};

/**
 * One route, a small view state machine synced to the URL. The stack is at
 * most two deep (home, then the flow), so back always lands on Home or the lesson.
 */
export function useView(): UseViewReturn {
  const [view, setView] = useState<ViewState>({ name: "home" });
  const depthRef = useRef(0);

  useEffect(() => {
    document.documentElement.dataset.view = view.name;
  }, [view.name]);

  useEffect(() => {
    const fromUrl = parseViewFromSearch(window.location.search);
    if (fromUrl.name !== "home") {
      history.replaceState(null, "", "/");
      history.pushState(null, "", buildURL(fromUrl));
      depthRef.current = 1;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deep link is applied once after hydration
      setView(fromUrl);
    }
    const onPopState = () => {
      const next = parseViewFromSearch(window.location.search);
      if (next.name === "home") depthRef.current = 0;
      setView(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const push = useCallback((next: ViewState) => {
    history.pushState(null, "", buildURL(next));
    depthRef.current += 1;
    setView(next);
  }, []);

  const replace = useCallback((next: ViewState) => {
    history.replaceState(null, "", buildURL(next));
    setView(next);
  }, []);

  const home = useCallback(() => {
    const depth = depthRef.current;
    depthRef.current = 0;
    setView({ name: "home" });
    if (depth > 0) history.go(-depth);
    else history.replaceState(null, "", "/");
  }, []);

  return { view, push, replace, home };
}
