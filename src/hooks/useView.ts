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

function parseViewFromURL(search: string): ViewState {
  const params = new URLSearchParams(search);
  const view = params.get("view");
  const d = params.get("d") as DiscoveryId | null;

  if (view === "lesson" && d) {
    const step = Math.max(1, parseInt(params.get("step") ?? "1", 10));
    return { name: "lesson", discoveryId: d, step };
  }
  if (view === "test" && d) return { name: "test", discoveryId: d };
  if (view === "result" && d) return { name: "result", discoveryId: d };
  if (view === "reward" && d) return { name: "reward", discoveryId: d };
  return { name: "home" };
}

function buildURL(view: ViewState): string {
  if (view.name === "home") return "/";
  const params = new URLSearchParams({ view: view.name, d: view.discoveryId });
  if (view.name === "lesson") params.set("step", String(view.step));
  return `/?${params.toString()}`;
}

function setDataView(name: ViewName): void {
  document.documentElement.dataset.view = name;
}

export type UseViewReturn = {
  view: ViewState;
  goHome: () => void;
  goLesson: (discoveryId: DiscoveryId, step?: number) => void;
  goTest: (discoveryId: DiscoveryId) => void;
  goResult: (discoveryId: DiscoveryId) => void;
  goReward: (discoveryId: DiscoveryId) => void;
  setStep: (step: number) => void;
};

export function useView(): UseViewReturn {
  // Always start at home so SSR and the first client paint match.
  // Deep links are applied in an effect below.
  const [view, setViewState] = useState<ViewState>({ name: "home" });

  // Depth tracking: how many pushState calls deep we are (for Android back)
  const depthRef = useRef(0);

  // Apply deep link once after mount, then keep data-view in sync.
  useEffect(() => {
    const fromUrl = parseViewFromURL(window.location.search);
    if (fromUrl.name !== "home") {
      // Replace so Android back from a deep-linked lesson stays in-app.
      history.replaceState(null, "", "/");
      history.pushState(null, "", buildURL(fromUrl));
      depthRef.current = 1;
      setViewState(fromUrl);
      setDataView(fromUrl.name);
    } else {
      setDataView("home");
    }

    const onPopState = () => {
      const nextView = parseViewFromURL(window.location.search);
      setViewState(nextView);
      setDataView(nextView.name);
      depthRef.current = Math.max(0, depthRef.current - 1);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((next: ViewState, replace = false) => {
    const url = buildURL(next);
    if (replace) {
      history.replaceState(null, "", url);
    } else {
      history.pushState(null, "", url);
      depthRef.current += 1;
    }
    setViewState(next);
    setDataView(next.name);
  }, []);

  const goHome = useCallback(() => navigate({ name: "home" }), [navigate]);

  const goLesson = useCallback(
    (discoveryId: DiscoveryId, step = 1) =>
      navigate({ name: "lesson", discoveryId, step }),
    [navigate],
  );

  const goTest = useCallback(
    (discoveryId: DiscoveryId) => navigate({ name: "test", discoveryId }),
    [navigate],
  );

  const goResult = useCallback(
    (discoveryId: DiscoveryId) => navigate({ name: "result", discoveryId }),
    [navigate],
  );

  const goReward = useCallback(
    (discoveryId: DiscoveryId) => navigate({ name: "reward", discoveryId }),
    [navigate],
  );

  // Update step without adding a history entry
  const setStep = useCallback(
    (step: number) => {
      if (view.name !== "lesson") return;
      const next: ViewState = { ...view, step };
      navigate(next, /* replace */ true);
    },
    [view, navigate],
  );

  return { view, goHome, goLesson, goTest, goResult, goReward, setStep };
}
