"use client";

import { BadgePin } from "@/components/app/BadgePin";
import { BottomBar } from "@/components/app/BottomBar";
import { Exhibit } from "@/components/app/Exhibit";
import { ScoreFires } from "@/components/app/ScoreFires";
import { PointsPill, StreakPill } from "@/components/app/StatusPills";
import { HomeTopBar } from "@/components/app/TopBar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { Check, ChevronRight, Lock } from "lucide-react";

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
  onSetting: (
    key: "haptics" | "calmMotion" | "darkMode" | "hinglish",
    value: boolean,
  ) => void;
};

type TileState =
  | { kind: "collected"; score: number }
  | { kind: "ready" }
  | { kind: "locked"; days: number };

export function HomeView({
  progress,
  todayKey,
  isDemo,
  justCollected,
  onStart,
  onOpenBadges,
  onSetting,
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
        right={
          <>
            <PointsPill points={progress.points} onPress={onOpenBadges} unseen={unseen} />
            <StreakPill count={streak} />
          </>
        }
      />

      <main className="scroll-area anim-view-in min-h-0 flex-1 px-[max(16px,env(safe-area-inset-left))] pb-8">
        {!progress.introDismissed || isDemo ? (
          <div className="flex min-h-9 items-center justify-between gap-3 px-1 pb-2">
            <p className="text-small text-ink-soft">
              {progress.introDismissed ? "" : copy.home.firstVisitLine}
            </p>
            {isDemo ? (
              <span className="bg-brass-tint text-brass-ink shrink-0 rounded-full px-2.5 py-0.5 text-[13px] leading-[20px] font-semibold">
                {copy.app.demoModeChip}
              </span>
            ) : null}
          </div>
        ) : (
          <div className="h-2" />
        )}

        <ExhibitCard
          discovery={featured}
          collected={featuredDone}
          score={progress.collected[featured.id]?.score}
          onStart={() => onStart(featured.id)}
        />

        <section className="mt-8" aria-labelledby="museum-heading">
          <div className="flex items-baseline justify-between px-1">
            <h2 id="museum-heading" className="text-title-s">
              {copy.home.museumHeading}
            </h2>
            <p className="tabular text-small text-ink-soft">
              {copy.home.countLine(collectedCount, discoveries.length)}
            </p>
          </div>
          <ul className="bg-surface ring-line mt-3 overflow-hidden rounded-[22px] ring-1">
            {discoveries.map((d, i) => (
              <li key={d.id} className={cn(i > 0 && "border-line border-t")}>
                <CollectionRow
                  discovery={d}
                  state={tileState(d)}
                  arriving={justCollected === d.id}
                  onOpen={() => onStart(d.id)}
                />
              </li>
            ))}
          </ul>
          {collectedCount === discoveries.length ? (
            <p className="text-small text-ink-soft mt-3 px-1">
              {copy.home.allCollectedLine}
            </p>
          ) : null}
        </section>

        <section className="mt-8" aria-labelledby="badges-heading">
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
            className="pressable bg-surface ring-line mt-2 grid w-full grid-cols-4 gap-1 rounded-[22px] px-2 pt-4 pb-3.5 ring-1"
            aria-label={`Badges: ${earned.size} of ${BADGE_ORDER.length} earned. Open badges`}
          >
            {BADGE_ORDER.map((id) => (
              <span key={id} className="flex flex-col items-center gap-1.5">
                <BadgePin id={id} earned={earned.has(id)} className="size-[52px]" />
                <span
                  className={cn(
                    "text-center text-[13px] leading-[16px] font-semibold",
                    earned.has(id) ? "text-ink" : "text-ink-soft",
                  )}
                >
                  {copy.badges.names[id]}
                </span>
              </span>
            ))}
          </button>
        </section>

        <section className="mt-8" aria-labelledby="prefs-heading">
          <h2 id="prefs-heading" className="text-title-s px-1">
            {copy.home.prefsHeading}
          </h2>
          <div className="bg-surface ring-line mt-3 overflow-hidden rounded-[22px] ring-1">
            <PreferenceRow
              id="pref-haptics"
              label={copy.home.hapticsLabel}
              hint={copy.home.hapticsHint}
              checked={progress.settings.haptics}
              onChange={(v) => onSetting("haptics", v)}
            />
            <div className="border-line ml-4 border-t" />
            <PreferenceRow
              id="pref-calm"
              label={copy.home.calmLabel}
              hint={copy.home.calmHint}
              checked={progress.settings.calmMotion}
              onChange={(v) => onSetting("calmMotion", v)}
            />
            <div className="border-line ml-4 border-t" />
            <PreferenceRow
              id="pref-dark"
              label={copy.home.darkLabel}
              hint={copy.home.darkHint}
              checked={progress.settings.darkMode}
              onChange={(v) => onSetting("darkMode", v)}
            />
            <div className="border-line ml-4 border-t" />
            <PreferenceRow
              id="pref-hinglish"
              label={copy.home.hinglishLabel}
              hint={copy.home.hinglishHint}
              checked={progress.settings.hinglish}
              onChange={(v) => onSetting("hinglish", v)}
            />
          </div>
        </section>

        <p className="text-caption text-ink-soft mt-8 text-center">
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
}: {
  discovery: Discovery;
  collected: boolean;
  score?: number;
  onStart: () => void;
}) {
  const domain = copy.domains[discovery.domain];
  return (
    <article
      data-domain={discovery.domain}
      className="bg-surface ring-line overflow-hidden rounded-[28px] shadow-[var(--shadow-md)] ring-1"
    >
      <button
        type="button"
        onClick={onStart}
        className="exhibit-press relative block h-[284px] w-full overflow-hidden"
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
          className="hairline-floor absolute inset-x-10 bottom-[30px]"
          aria-hidden="true"
        />
        <span
          className="absolute inset-x-0 top-7 bottom-6 flex justify-center"
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
        <span className="bg-surface/90 text-ink absolute top-3.5 left-3.5 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold shadow-[var(--shadow-sm)]">
          <span className="bg-brass size-1.5 rounded-full" aria-hidden="true" />
          {copy.home.today}
        </span>
        <span className="tabular text-ink-soft absolute top-3.5 right-3.5 inline-flex h-8 items-center rounded-full px-3 text-[13px] font-semibold">
          {discovery.catalogNo}
        </span>
        {collected ? (
          <span className="border-brass-ink bg-surface/80 font-display text-brass-ink absolute right-4 bottom-4 inline-flex -rotate-6 items-center gap-1 rounded-lg border-2 px-2 py-0.5 text-[13px] font-semibold tracking-[0.08em] uppercase">
            <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
            {copy.home.understood}
          </span>
        ) : null}
      </button>
      <div className="px-5 pt-4 pb-5">
        <p className="eyebrow text-domain">{domain}</p>
        <h1 className="text-display mt-1">{discovery.title}</h1>
        <p className="text-small text-ink-soft mt-2">
          {collected
            ? copy.home.collectedToday
            : copy.home.meta(discovery.steps.length, discovery.quiz.length)}
        </p>
        {collected && typeof score === "number" ? (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-caption text-ink-soft font-semibold">
              {copy.home.scoreLabel}
            </span>
            <ScoreFires score={score} size="sm" />
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
}: {
  discovery: Discovery;
  state: TileState;
  arriving: boolean;
  onOpen: () => void;
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
    <button
      type="button"
      onClick={onPress}
      data-domain={discovery.domain}
      aria-disabled={locked || undefined}
      className="pressable active:bg-sunk/50 relative flex min-h-[80px] w-full items-center gap-3.5 px-3.5 py-3 text-left"
    >
      <span
        className={cn(
          "relative flex size-[56px] shrink-0 items-center justify-center overflow-hidden rounded-[16px]",
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
        <span className={cn("block h-[44px]", arriving && "anim-pop-in")}>
          <Exhibit
            id={discovery.id}
            idPrefix={`row-${discovery.id}`}
            tone={locked ? "silhouette" : "full"}
            className="h-full w-auto"
          />
        </span>
        {arriving ? (
          <span
            className="ring-brass absolute inset-0 rounded-[16px] ring-2"
            style={{ animation: "arrive-ring 900ms var(--ease-out) 200ms both" }}
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block text-[17px] leading-[22px] font-semibold",
            locked ? "text-ink-soft" : "text-ink",
          )}
        >
          {discovery.shortName}
        </span>
        {locked ? (
          <span className="text-caption text-ink-soft mt-0.5 flex items-center gap-1 font-semibold">
            <Lock className="size-3.5" aria-hidden="true" />
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
        <span className="text-domain inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold">
          {copy.home.ready}
          <ChevronRight className="size-4" aria-hidden="true" />
        </span>
      ) : null}
    </button>
  );
}

function PreferenceRow({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex min-h-[68px] items-center gap-3 py-2 pr-2 pl-4">
      <div className="min-w-0 flex-1">
        <p id={`${id}-label`} className="text-[17px] leading-[22px] font-semibold">
          {label}
        </p>
        <p id={`${id}-hint`} className="text-caption text-ink-soft">
          {hint}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-hint`}
      />
    </div>
  );
}
