"use client";

import { HomeObject } from "@/components/app/HomeObject";
import { HomeScene } from "@/components/scene/HomeScene";
import { Shelf } from "@/components/app/Shelf";
import { copy } from "@/content/copy";
import { artLoaders, discoveries } from "@/content/index";
import type { Discovery, Progress } from "@/content/types";
import { toDateKey } from "@/lib/date";
import { getTodaysDiscoveryForDate } from "@/lib/unlock";
import type { DiscoveryId } from "@/content/types";
import { useEffect } from "react";

type HomeViewProps = {
  progress: Progress;
  isDemo: boolean;
  onStartDiscovery: (discoveryId: DiscoveryId) => void;
};

/**
 * HomeView: the museum home screen.
 * Scene (58svh) + catalog line + title + shelf + badges.
 * Preloads today's lesson art on idle.
 */
export function HomeView({ progress, isDemo, onStartDiscovery }: HomeViewProps) {
  const todayKey = toDateKey(new Date());
  const { discovery, state } = getTodaysDiscoveryForDate(
    discoveries,
    progress,
    todayKey,
    isDemo,
  );

  // Preload today's lesson chunk on idle
  useEffect(() => {
    const load = () => artLoaders[discovery.id]();
    if (typeof requestIdleCallback !== "undefined") {
      const id = requestIdleCallback(load, { timeout: 1000 });
      return () => cancelIdleCallback(id);
    } else {
      const t = setTimeout(load, 1000);
      return () => clearTimeout(t);
    }
  }, [discovery.id]);

  const showFirstVisitLine =
    !progress.introDismissed && state === "new";

  return (
    <div className="flex flex-1 flex-col overflow-y-auto overscroll-y-none">
      {/* Hero scene */}
      <HomeScene>
        <HomeObject
          discovery={discovery}
          onPress={() => onStartDiscovery(discovery.id)}
        />
      </HomeScene>

      {/* Content below scene */}
      <div className="flex flex-col gap-1 px-5 pt-5 pb-2">
        {/* First visit line */}
        {showFirstVisitLine && (
          <p className="text-[15px] text-muted-foreground mb-1">
            {copy.home.firstVisitLine}
          </p>
        )}

        {/* All-collected line */}
        {state === "all-done" && (
          <p className="text-[15px] text-muted-foreground mb-1">
            {copy.home.allCollectedLine}
          </p>
        )}

        {/* Catalog line */}
        <p className="text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
          {copy.catalogLine(discovery.catalogNo, copy.domains[discovery.domain])}
        </p>

        {/* Title */}
        <h1 className="font-display text-[28px] font-[600] leading-tight text-foreground">
          {discovery.title}
        </h1>
      </div>

      {/* Museum shelf */}
      <div className="mt-4">
        <Shelf progress={progress} isDemo={isDemo} />
      </div>
    </div>
  );
}
