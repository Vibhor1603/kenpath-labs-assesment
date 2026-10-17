"use client";

import { AppShell } from "@/components/app/AppShell";
import { BadgeSheet } from "@/components/app/BadgeSheet";
import { BottomBar } from "@/components/app/BottomBar";
import { HomeView } from "@/components/app/HomeView";
import { LessonView, getLessonPrimaryLabel } from "@/components/app/LessonView";
import { LiveRegion } from "@/components/app/LiveRegion";
import { PointsChip } from "@/components/app/PointsChip";
import { ResultView } from "@/components/app/ResultView";
import { RewardMoment } from "@/components/app/RewardMoment";
import { SettingsPopover } from "@/components/app/SettingsPopover";
import { StreakSprout } from "@/components/app/StreakSprout";
import { TestView } from "@/components/app/TestView";
import { TopBar } from "@/components/app/TopBar";
import { ViewErrorBoundary } from "@/components/app/ViewErrorBoundary";
import { copy } from "@/content/copy";
import { discoveries, getDiscovery } from "@/content/index";
import type { DiscoveryId, TestOutcome } from "@/content/types";
import { toDateKey } from "@/lib/date";
import { getTodaysDiscoveryForDate } from "@/lib/unlock";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useOnlineToast } from "@/hooks/useOnlineToast";
import { useProgress } from "@/hooks/useProgress";
import { useView } from "@/hooks/useView";
import { daysBetween } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";

/** Computes the streak count to display (0 if streak is stale). */
function getDisplayStreak(lastPerfectDate: string | null, count: number): number {
  if (!lastPerfectDate) return 0;
  const today = toDateKey(new Date());
  const diff = daysBetween(lastPerfectDate, today);
  return diff <= 1 ? count : 0;
}

export default function HomePage() {
  const { view, goHome, goLesson, goTest, goResult, goReward, setStep } = useView();
  const { progress, dispatch, finishTest } = useProgress();
  const isDemo = useDemoMode();

  const [liveMessage, setLiveMessage] = useState("");
  const [badgeSheetOpen, setBadgeSheetOpen] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [testOutcome, setTestOutcome] = useState<TestOutcome | null>(null);
  const testNextRef = useRef<(() => void) | null>(null);
  const [testNextReady, setTestNextReady] = useState(false);

  useOnlineToast();

  const displayStreak = getDisplayStreak(
    progress.streak.lastPerfectDate,
    progress.streak.count,
  );

  const handleStartDiscovery = useCallback(
    (discoveryId: DiscoveryId) => {
      dispatch({ type: "dismissIntro" });
      goLesson(discoveryId, 1);
    },
    [dispatch, goLesson],
  );

  const handleTestComplete = useCallback(
    (score: number) => {
      const discoveryId =
        view.name === "test"
          ? view.discoveryId
          : view.name === "lesson"
            ? view.discoveryId
            : ("fridge" as DiscoveryId);

      setTestScore(score);
      const outcome = finishTest(discoveryId, score);
      setTestOutcome(outcome);

      if (outcome.isPerfect) {
        goReward(discoveryId);
      } else {
        goResult(discoveryId);
      }
    },
    [view, finishTest, goReward, goResult],
  );

  const handleGoToTest = useCallback(() => {
    if (view.name !== "lesson") return;
    goTest(view.discoveryId);
  }, [view, goTest]);

  const isLesson = view.name === "lesson";
  const activeDiscoveryId =
    view.name === "lesson" ||
    view.name === "test" ||
    view.name === "result" ||
    view.name === "reward"
      ? view.discoveryId
      : null;

  const discovery = activeDiscoveryId ? getDiscovery(activeDiscoveryId) : null;
  const totalSteps = isLesson ? (discovery?.steps.length ?? 0) : undefined;

  // Determine today's discovery for the home start button
  const todayKey = toDateKey(new Date());
  const todayDiscovery = getTodaysDiscoveryForDate(
    discoveries,
    progress,
    todayKey,
    isDemo,
  );

  const isLastLessonStep =
    isLesson &&
    view.name === "lesson" &&
    view.step >= (totalSteps ?? 0);

  return (
    <>
      <LiveRegion message={liveMessage} />
      <AppShell
        calmMotion={progress.settings.calmMotion}
        topBar={
          <TopBar
            view={view}
            totalSteps={totalSteps}
            isDemo={isDemo}
            onBack={goHome}
            pointsChip={
              <button
                onClick={() => setBadgeSheetOpen(true)}
                className="touch-manipulation"
                aria-label="Open badge collection"
              >
                <PointsChip points={progress.points} />
              </button>
            }
            sprout={<StreakSprout streakCount={displayStreak} />}
          />
        }
        bottomBar={
          <BottomBar
            primaryAction={
              view.name === "home" ? (
                <PrimaryButton
                  label={copy.home.startDiscovery}
                  onPress={() => handleStartDiscovery(todayDiscovery.discovery.id)}
                />
              ) : view.name === "lesson" ? (
                <PrimaryButton
                  label={getLessonPrimaryLabel(view.step, totalSteps ?? 0)}
                  onPress={isLastLessonStep ? handleGoToTest : () => setStep(view.step + 1)}
                />
              ) : view.name === "test" ? (
                <PrimaryButton
                  label={copy.test.next}
                  onPress={() => testNextRef.current?.()}
                  disabled={!testNextReady}
                />
              ) : (
                <div />
              )
            }
            secondaryAction={
              isLesson && view.name === "lesson" && view.step > 1 ? (
                <BackButton onPress={() => setStep(view.step - 1)} />
              ) : isLesson ? (
                <SettingsPopover progress={progress} dispatch={dispatch} />
              ) : undefined
            }
          />
        }
      >
        <ViewErrorBoundary>
          {view.name === "home" && (
            <HomeView
              progress={progress}
              isDemo={isDemo}
              onStartDiscovery={handleStartDiscovery}
            />
          )}

          {view.name === "lesson" && (
            <LessonView
              discoveryId={view.discoveryId}
              stepIndex={view.step}
              onStepChange={setStep}
              onFinish={handleGoToTest}
              liveMessage={liveMessage}
              setLiveMessage={setLiveMessage}
            />
          )}

          {view.name === "test" && (
            <TestView
              discoveryId={view.discoveryId}
              attemptNumber={progress.attempts[view.discoveryId] ?? 0}
              onComplete={handleTestComplete}
              onNextReady={(handler, isReady) => {
                testNextRef.current = handler;
                setTestNextReady(isReady);
              }}
            />
          )}

          {view.name === "result" && testOutcome !== null && (
            <ResultView
              discoveryId={view.discoveryId}
              score={testScore}
              onTryAgain={() => goTest(view.discoveryId)}
              onWatchLesson={() => goLesson(view.discoveryId, 1)}
            />
          )}

          {view.name === "reward" && testOutcome !== null && (
            <RewardMoment
              discoveryId={view.discoveryId}
              points={progress.points}
              pointsEarned={testOutcome.pointsEarned}
              streakAfter={testOutcome.streakAfter}
              newBadges={testOutcome.newBadges}
              onComplete={goHome}
            />
          )}
        </ViewErrorBoundary>
      </AppShell>

      <BadgeSheet
        open={badgeSheetOpen}
        onClose={() => setBadgeSheetOpen(false)}
        badges={progress.badges}
      />
    </>
  );
}

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

function PrimaryButton({ label, onPress, disabled }: PrimaryButtonProps) {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center",
        "h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "text-[17px] font-medium",
        "active:scale-[0.97] transition-transform duration-100",
        "focus-visible:outline-2 focus-visible:outline-offset-2",
        "touch-manipulation",
        "disabled:opacity-40 disabled:cursor-not-allowed",
      )}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {label}
    </button>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      className="flex size-12 items-center justify-center rounded-full bg-card border border-border/50 text-foreground active:scale-95 transition-transform touch-manipulation"
      aria-label={copy.lesson.back}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13 4L7 10l6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
