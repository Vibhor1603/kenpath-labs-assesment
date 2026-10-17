"use client";

import { Trophy } from "@/components/app/Trophy";
import { copy } from "@/content/copy";
import { discoveries } from "@/content/index";
import type { Progress } from "@/content/types";
import { isDiscoveryUnlocked } from "@/lib/unlock";

type ShelfProps = {
  progress: Progress;
  isDemo: boolean;
};

/**
 * Shelf: a wooden museum shelf with 3 trophy slots.
 * Horizontal scroll with snap, overscroll-x contain.
 * Collected objects show as trophies; locked slots show silhouettes.
 */
export function Shelf({ progress, isDemo }: ShelfProps) {
  const collectedCount = Object.keys(progress.collected).length;
  const countLine = copy.home.thingsUnderstand(collectedCount);

  return (
    <section className="py-4" aria-label="Your museum shelf">
      {/* Heading */}
      <div className="px-4 mb-3 flex items-baseline justify-between">
        <h2 className="text-[17px] font-[600] text-foreground">
          {copy.home.museumHeading}
        </h2>
        {collectedCount > 0 && (
          <span className="text-[13px] text-muted-foreground">{countLine}</span>
        )}
      </div>

      {/* Shelf surface */}
      <div className="relative">
        {/* Wooden shelf edge */}
        <div
          className="absolute bottom-0 left-0 right-0 h-3 rounded-sm"
          style={{
            background:
              "linear-gradient(180deg, #D4B896 0%, #C4A882 60%, #B89A72 100%)",
            boxShadow: "0 2px 6px rgba(43,36,32,0.18)",
          }}
        />

        {/* Slot scroll area */}
        <div
          className="flex gap-4 overflow-x-auto pb-6 px-4"
          style={{
            scrollSnapType: "x mandatory",
            overscrollBehaviorX: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {discoveries.map((discovery) => {
            const unlocked = isDiscoveryUnlocked(
              discovery.day,
              progress.maxUnlockedDay,
              isDemo,
            );
            const collected = Boolean(progress.collected[discovery.id]);

            return (
              <div
                key={discovery.id}
                className="shrink-0 w-[120px]"
                style={{ scrollSnapAlign: "start", contentVisibility: "auto" }}
              >
                <div
                  className="flex h-[180px] flex-col items-center justify-end rounded-[16px] bg-card border border-border/30 p-3 relative"
                  style={{
                    boxShadow:
                      "0 2px 8px oklch(0.196 0.017 48.56 / 0.06), 0 1px 3px oklch(0.196 0.017 48.56 / 0.04)",
                  }}
                >
                  {collected ? (
                    <Trophy
                      discovery={discovery}
                      isCollected={collected}
                      catalogNo={discovery.catalogNo}
                    />
                  ) : (
                    <LockedSlot
                      catalogNo={discovery.catalogNo}
                      unlocked={unlocked}
                      daysUntil={
                        !unlocked && !isDemo
                          ? discovery.day - progress.maxUnlockedDay
                          : 0
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function LockedSlot({
  catalogNo,
  unlocked,
  daysUntil,
}: {
  catalogNo: string;
  unlocked: boolean;
  daysUntil: number;
}) {
  return (
    <div className="flex flex-col items-center gap-2 w-full opacity-50">
      <div className="h-[90px] w-[64px] rounded-[10px] bg-muted/40 border border-border/20" />
      <div className="w-full rounded-[8px] bg-muted/30 px-2 py-1.5 text-center">
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground leading-none">
          {catalogNo}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {unlocked
            ? "Not yet collected"
            : daysUntil === 1
              ? copy.locked.opensTomorrow
              : copy.locked.opensInDays(daysUntil)}
        </p>
      </div>
    </div>
  );
}
