"use client";

import { BadgePin } from "@/components/app/BadgePin";
import { BottomBar } from "@/components/app/BottomBar";
import { Exhibit } from "@/components/app/Exhibit";
import { ScoreFires } from "@/components/app/ScoreFires";
import { PointsPill, StreakPill } from "@/components/app/StatusPills";
import { HomeTopBar } from "@/components/app/TopBar";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import { discoveries } from "@/content/index";
import type { BadgeId, Discovery, DiscoveryId, Progress } from "@/content/types";
import { getUnseenBadges } from "@/lib/badges";
import { getDisplayedStreak } from "@/lib/streak";
import { toast } from "@/lib/toast";
import {
  getDayIndex,
  getDaysUntilUnlock,
  getNextMaxUnlockedDay,
  getTodaysDiscoveryForDate,
  isDiscoveryUnlocked,
} from "@/lib/unlock";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Lock, Share2 } from "lucide-react";

const BADGE_ORDER: BadgeId[] = [
  "first-discovery",
  "perfect-scholar",
  "close-call",
  "return-visitor",
  "streak-3",
  "curious-mind",
];

type HomeViewProps = {
  progress: Progress;
  todayKey: string;
  isDemo: boolean;
  justCollected: DiscoveryId | null;
  onStart: (id: DiscoveryId) => void;
  onOpenBadges: () => void;
  onOpenShop: () => void;
  onOpenMenu: () => void;
  onShare: (id: DiscoveryId) => void;
};

type TileState =
  | { kind: "collected"; score: number }
  | { kind: "ready" }
  | { kind: "locked"; days: number };

/** Display-only upcoming exhibits. No unlock logic or lessons yet. */
const UPCOMING_TEASERS: {
  id: string;
  name: string;
  catalogNo: string;
  days: number;
}[] = [
  { id: "eye", name: "Eye", catalogNo: "No. 004", days: 3 },
  { id: "battery", name: "Battery", catalogNo: "No. 005", days: 4 },
  { id: "seed", name: "Seed", catalogNo: "No. 006", days: 5 },
  { id: "lung", name: "Lung", catalogNo: "No. 007", days: 6 },
];

export function HomeView({
  progress,
  todayKey,
  isDemo,
  justCollected,
  onStart,
  onOpenBadges,
  onOpenShop,
  onOpenMenu,
  onShare,
}: HomeViewProps) {
  const today = getTodaysDiscoveryForDate(discoveries, progress, todayKey, isDemo);
  const featured = today.discovery;
  const featuredDone = Boolean(progress.collected[featured.id]);
  const dayIndex = getDayIndex(progress.firstVisitDate, todayKey);
  const unlockMax = isDemo
    ? 3
    : getNextMaxUnlockedDay(progress.maxUnlockedDay, Math.min(dayIndex, 3));
  const collectedCount = discoveries.filter((d) => progress.collected[d.id]).length;
  const streak = getDisplayedStreak(progress.streak, todayKey);
  const earned = new Set(progress.badges.map((b) => b.id));
  const unseen = getUnseenBadges(progress).length > 0;

  const tileState = (d: Discovery): TileState => {
    const entry = progress.collected[d.id];
    if (entry) return { kind: "collected", score: entry.score ?? 4 };
    if (isDiscoveryUnlocked(d.day, unlockMax, isDemo)) return { kind: "ready" };
    return { kind: "locked", days: Math.max(1, getDaysUntilUnlock(d.day, dayIndex)) };
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <HomeTopBar
        onMenu={onOpenMenu}
        right={
          <>
            <PointsPill
              points={progress.points - (progress.spentPoints ?? 0)}
              onPress={onOpenShop}
              unseen={unseen}
            />
            <StreakPill count={streak} />
          </>
        }
      />

      <main className="scroll-area anim-view-in min-h-0 flex-1 px-[max(14px,env(safe-area-inset-left))] pb-6">
        {!progress.introDismissed || isDemo ? (
          <div className="flex min-h-8 items-center justify-between gap-3 px-1 pb-1.5">
            <p className="text-small text-ink-soft">
              {progress.introDismissed ? "" : copy.home.firstVisitLine}
            </p>
            {isDemo ? (
              <span className="bg-brass-tint text-brass-ink shrink-0 rounded-full px-2 py-0.5 text-[12px] leading-[18px] font-semibold">
                {copy.app.demoModeChip}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="h-1.5" />
        )}

        <ExhibitCard
          discovery={featured}
          collected={featuredDone}
          score={progress.collected[featured.id]?.score}
          onStart={() => onStart(featured.id)}
          onShare={
            featuredDone ? () => onShare(featured.id) : undefined
          }
        />

        <section className="mt-6" aria-labelledby="museum-heading">
          <div className="flex items-baseline justify-between px-1">
            <h2 id="museum-heading" className="text-title-s">
              {copy.home.museumHeading}
            </h2>
            <p className="tabular text-small text-ink-soft">
              {copy.home.countLine(collectedCount, discoveries.length)}
            </p>
          </div>
          <ul className="bg-surface ring-line mt-2 overflow-hidden rounded-[16px] ring-1">
            {discoveries.map((d, i) => (
              <li key={d.id} className={cn(i > 0 && "border-line border-t")}>
                <CollectionRow
                  discovery={d}
                  state={tileState(d)}
                  arriving={justCollected === d.id}
                  onOpen={() => onStart(d.id)}
                  onShare={() => onShare(d.id)}
                />
              </li>
            ))}
            {UPCOMING_TEASERS.map((teaser) => (
              <li key={teaser.id} className="border-line border-t">
                <LockedTeaserRow teaser={teaser} />
              </li>
            ))}
          </ul>
          {collectedCount === discoveries.length ? (
            <p className="text-small text-ink-soft mt-2 px-1">
              {copy.home.allCollectedLine}
            </p>
          ) : null}
        </section>

        <section className="mt-6" aria-labelledby="badges-heading">
          <div className="flex items-center justify-between px-1">
            <h2 id="badges-heading" className="text-title-s">
              {copy.home.badgesHeading}
            </h2>
            <Button
              variant="quiet"
              size="md"
              className="text-ink-soft -mr-3"
              onClick={onOpenBadges}
            >
              {copy.home.seeAll}
              <ChevronRight aria-hidden="true" />
            </Button>
          </div>
          <button
            type="button"
            onClick={onOpenBadges}
            className="pressable bg-surface ring-line mt-2 grid w-full grid-cols-4 gap-1 rounded-[18px] px-2 pt-3 pb-3 ring-1"
            aria-label={`Badges: ${earned.size} of ${BADGE_ORDER.length} earned. Open badges`}
          >
            {BADGE_ORDER.map((id) => (
              <span key={id} className="flex flex-col items-center gap-1">
                <BadgePin id={id} earned={earned.has(id)} className="size-[44px]" />
                <span
                  className={cn(
                    "text-center text-[11px] leading-[14px] font-semibold",
                    earned.has(id) ? "text-ink" : "text-ink-soft",
                  )}
                >
                  {copy.badges.names[id]}
                </span>
              </span>
            ))}
          </button>
        </section>

        <p className="text-caption text-ink-soft mt-6 text-center">
          {copy.home.savedLine}
        </p>
      </main>

      <BottomBar>
        <Button className="flex-1" onClick={() => onStart(featured.id)}>
          {featuredDone ? copy.home.watchAgain : copy.home.startDiscovery}
        </Button>
      </BottomBar>
    </div>
  );
}

function ExhibitCard({
  discovery,
  collected,
  score,
  onStart,
  onShare,
}: {
  discovery: Discovery;
  collected: boolean;
  score?: number;
  onStart: () => void;
  onShare?: () => void;
}) {
  const domain = copy.domains[discovery.domain];
  return (
    <article
      data-domain={discovery.domain}
      className="bg-surface ring-line overflow-hidden rounded-[18px] shadow-[var(--shadow-md)] ring-1"
    >
      <button
        type="button"
        onClick={onStart}
        className="exhibit-press relative block h-[200px] w-full overflow-hidden"
        aria-label={`${collected ? copy.home.watchAgain : copy.home.startDiscovery}: ${discovery.title}`}
      >
        <span
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 62% at 50% 40%, var(--surface) 0%, var(--domain-tint) 68%, color-mix(in oklch, var(--domain-tint), var(--sunk) 50%) 100%)",
          }}
          aria-hidden="true"
        />
        <span
          className="hairline-floor absolute inset-x-8 bottom-[24px]"
          aria-hidden="true"
        />
        <span
          className="absolute inset-x-0 top-6 bottom-5 flex justify-center"
          aria-hidden="true"
        >
          <span
            className="exhibit-art block h-full"
            style={{ viewTransitionName: "exhibit" }}
          >
            <span className="idle-settle block h-full">
              <Exhibit
                id={discovery.id}
                idPrefix={`home-${discovery.id}`}
                className="h-full w-auto"
              />
            </span>
          </span>
        </span>
        <span className="bg-surface/90 text-ink absolute top-2.5 left-2.5 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold shadow-[var(--shadow-sm)]">
          <span className="bg-brass size-1.5 rounded-full" aria-hidden="true" />
          {copy.home.today}
        </span>
        <span className="tabular text-ink-soft absolute top-2.5 right-2.5 inline-flex h-7 items-center rounded-full px-2.5 text-[12px] font-semibold">
          {discovery.catalogNo}
        </span>
        {collected ? (
          <span className="border-brass-ink bg-surface/80 font-display text-brass-ink absolute right-3 bottom-3 inline-flex -rotate-6 items-center gap-1 rounded-md border-2 px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.08em] uppercase">
            <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            {copy.home.understood}
          </span>
        ) : null}
      </button>
      <div className="px-3.5 pt-3.5 pb-4">
        <p className="eyebrow text-domain">{domain}</p>
        <h1 className="text-title mt-1 font-semibold tracking-[-0.02em]">
          {discovery.title}
        </h1>
        <p className="text-small text-ink-soft mt-1.5">
          {collected
            ? copy.home.collectedToday
            : copy.home.meta(discovery.steps.length, discovery.quiz.length)}
        </p>
        {collected && typeof score === "number" ? (
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-caption text-ink-soft font-semibold">
                {copy.home.scoreLabel}
              </span>
              <ScoreFires score={score} size="sm" />
            </div>
            {onShare ? (
              <Button variant="secondary" size="md" onClick={onShare}>
                <Share2 className="size-3.5" aria-hidden="true" />
                {copy.share.shareAction}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CollectionRow({
  discovery,
  state,
  arriving,
  onOpen,
  onShare,
}: {
  discovery: Discovery;
  state: TileState;
  arriving: boolean;
  onOpen: () => void;
  onShare: () => void;
}) {
  const locked = state.kind === "locked";
  const lockedLine =
    state.kind === "locked"
      ? state.days === 1
        ? copy.locked.opensTomorrow.replace(/\.$/, "")
        : copy.locked.opensInDays(state.days)
      : "";
  const onPress = () => {
    if (locked) toast(`${discovery.shortName}. ${lockedLine}.`);
    else onOpen();
  };
  return (
    <div
      data-domain={discovery.domain}
      className="relative flex min-h-[58px] w-full items-center gap-2.5 px-2.5 py-2"
    >
      <button
        type="button"
        onClick={onPress}
        aria-disabled={locked || undefined}
        className="pressable active:bg-sunk/50 flex min-w-0 flex-1 items-center gap-2.5 text-left"
      >
        <span
          className={cn(
            "relative flex size-[40px] shrink-0 items-center justify-center overflow-hidden rounded-[12px]",
            locked ? "bg-sunk text-line-strong" : "",
          )}
          style={
            locked
              ? undefined
              : {
                  background:
                    "radial-gradient(80% 80% at 50% 35%, var(--surface), var(--domain-tint))",
                }
          }
          aria-hidden="true"
        >
          <span className={cn("block h-[32px]", arriving && "anim-pop-in")}>
            <Exhibit
              id={discovery.id}
              idPrefix={`row-${discovery.id}`}
              tone={locked ? "silhouette" : "full"}
              className="h-full w-auto"
            />
          </span>
          {arriving ? (
            <span
              className="ring-brass absolute inset-0 rounded-[12px] ring-2"
              style={{ animation: "arrive-ring 900ms var(--ease-out) 200ms both" }}
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block text-[14px] leading-[18px] font-semibold",
              locked ? "text-ink-soft" : "text-ink",
            )}
          >
            {discovery.shortName}
          </span>
          {locked ? (
            <span className="text-caption text-ink-soft mt-0.5 flex items-center gap-1 font-semibold">
              <Lock className="size-2.5" aria-hidden="true" />
              {lockedLine}
            </span>
          ) : (
            <span className="tabular text-caption text-ink-soft mt-0.5 block">
              {discovery.catalogNo} · {copy.domains[discovery.domain]}
            </span>
          )}
        </span>
        {state.kind === "collected" ? (
          <span className="inline-flex shrink-0 flex-col items-end gap-0.5">
            <ScoreFires score={state.score} size="sm" />
            <span className="sr-only">
              {copy.home.understood}. {copy.home.scoreLabel}: {state.score} of 5
            </span>
          </span>
        ) : state.kind === "ready" ? (
          <span className="text-domain inline-flex shrink-0 items-center gap-0.5 text-[11px] font-semibold">
            {copy.home.ready}
            <ChevronRight className="size-3" aria-hidden="true" />
          </span>
        ) : null}
      </button>
      {state.kind === "collected" ? (
        <button
          type="button"
          onClick={onShare}
          aria-label={`${copy.share.shareAction} ${discovery.shortName}`}
          className="pressable text-ink-soft hover:text-ink hover:bg-sunk/70 inline-flex size-8 shrink-0 items-center justify-center rounded-full"
        >
          <Share2 className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

function LockedTeaserRow({
  teaser,
}: {
  teaser: (typeof UPCOMING_TEASERS)[number];
}) {
  const lockedLine =
    teaser.days === 1
      ? copy.locked.opensTomorrow.replace(/\.$/, "")
      : copy.locked.opensInDays(teaser.days);
  return (
    <button
      type="button"
      onClick={() => toast(`${teaser.name}. ${lockedLine}.`)}
      aria-disabled="true"
      className="pressable active:bg-sunk/50 relative flex min-h-[58px] w-full items-center gap-2.5 px-2.5 py-2 text-left"
    >
      <span
        className="bg-sunk text-line-strong relative flex size-[40px] shrink-0 items-center justify-center overflow-hidden rounded-[12px]"
        aria-hidden="true"
      >
        <Lock className="size-3.5 opacity-50" strokeWidth={2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink-soft block text-[14px] leading-[18px] font-semibold">
          {teaser.name}
        </span>
        <span className="text-caption text-ink-soft mt-0.5 flex items-center gap-1 font-semibold">
          <Lock className="size-2.5" aria-hidden="true" />
          {lockedLine}
        </span>
      </span>
      <span className="tabular text-caption text-ink-soft sr-only">
        {teaser.catalogNo}
      </span>
    </button>
  );
}

