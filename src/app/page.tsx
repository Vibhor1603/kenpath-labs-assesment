"use client";

import dynamic from "next/dynamic";
import { AppFrame } from "@/components/app/AppFrame";
import { HomeView } from "@/components/app/HomeView";
import LessonView from "@/components/app/LessonView";
import ResultView from "@/components/app/ResultView";
import RewardView from "@/components/app/RewardView";
import TestView from "@/components/app/TestView";
import { LiveRegion } from "@/components/app/LiveRegion";
import { Toaster } from "@/components/app/Toaster";
import { ViewErrorBoundary } from "@/components/app/ViewErrorBoundary";
import { copy } from "@/content/copy";
import { discoveries, getDiscovery } from "@/content/index";
import type { BadgeId, DiscoveryId, TestOutcome } from "@/content/types";
import { useAuth } from "@/hooks/useAuth";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useDeviceFlags } from "@/hooks/useDeviceFlags";
import { useOnlineToast } from "@/hooks/useOnlineToast";
import { useProgress } from "@/hooks/useProgress";
import { useView, type ViewState } from "@/hooks/useView";
import { getUnseenBadges } from "@/lib/badges";
import { toDateKey } from "@/lib/date";
import { loadLessonArt } from "@/lib/lessonArt";
import { canRedeem, getShopItem } from "@/lib/rewards";
import { toast } from "@/lib/toast";
import {
  getDayIndex,
  getNextMaxUnlockedDay,
  getTodaysDiscoveryForDate,
  isDiscoveryUnlocked,
} from "@/lib/unlock";
import { navigateWithTransition } from "@/lib/viewTransition";
import { useCallback, useEffect, useState } from "react";

const BadgeSheet = dynamic(
  () => import("@/components/app/BadgeSheet").then((m) => m.BadgeSheet),
  {
    ssr: false,
  },
);
const NewBadgeDialog = dynamic(
  () => import("@/components/app/NewBadgeDialog").then((m) => m.NewBadgeDialog),
  { ssr: false },
);
const MenuSheet = dynamic(
  () => import("@/components/app/MenuSheet").then((m) => m.MenuSheet),
  { ssr: false },
);
const AuthSheet = dynamic(
  () => import("@/components/app/AuthSheet").then((m) => m.AuthSheet),
  { ssr: false },
);
const ShareAchievementSheet = dynamic(
  () =>
    import("@/components/app/ShareAchievementSheet").then(
      (m) => m.ShareAchievementSheet,
    ),
  { ssr: false },
);
const ShopSheet = dynamic(
  () => import("@/components/app/ShopSheet").then((m) => m.ShopSheet),
  { ssr: false },
);

type Attempt = { discoveryId: DiscoveryId; results: boolean[]; outcome: TestOutcome };

function whenIdle(fn: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: 1000 });
    return () => window.cancelIdleCallback(id);
  }
  const t = setTimeout(fn, 1000);
  return () => clearTimeout(t);
}

export default function Page() {
  // Reads ?demo= before useView rewrites the URL for a deep link (effects run in hook order).
  const isDemo = useDemoMode();
  const { view, push, replace, home } = useView();
  const { progress, hydrated, dispatch, finishTest, attachAccount, detachAccount } =
    useProgress();
  const { user, register, login, logout, rename } = useAuth();
  const flags = useDeviceFlags(progress.settings.calmMotion);
  useOnlineToast();

  useEffect(() => {
    const root = document.documentElement;
    const dark = progress.settings.darkMode;
    if (dark) root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");
    // Keep browser chrome (and local/prod) aligned with the same black canvas.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#121212" : "#F3F0EA");
  }, [progress.settings.darkMode]);

  // Returning session: bind account mirror without a toast every reload.
  useEffect(() => {
    if (!hydrated || !user) return;
    attachAccount(user.username, { silent: true });
  }, [hydrated, user?.username, attachAccount, user]);

  const todayKey = toDateKey(new Date());
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [shareId, setShareId] = useState<DiscoveryId | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [testKey, setTestKey] = useState(0);
  const [justCollected, setJustCollected] = useState<DiscoveryId | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<BadgeId[]>([]);
  const shareDiscovery = shareId ? getDiscovery(shareId) : null;

  const animate = flags.mounted && !flags.calm && !flags.lite;
  const go = useCallback(
    (update: () => void) => navigateWithTransition(update, animate),
    [animate],
  );

  const dayIndex = getDayIndex(progress.firstVisitDate, todayKey);
  const unlockMax = isDemo
    ? 3
    : getNextMaxUnlockedDay(progress.maxUnlockedDay, Math.min(dayIndex, 3));
  const featured = getTodaysDiscoveryForDate(
    discoveries,
    progress,
    todayKey,
    isDemo,
  ).discovery;
  const active = view.name === "home" ? undefined : getDiscovery(view.discoveryId);

  // A deep link to a locked lesson, or to a result without a finished test, goes home.
  useEffect(() => {
    if (!hydrated || view.name === "home") return;
    const d = getDiscovery(view.discoveryId);
    const open =
      d && (progress.collected[d.id] || isDiscoveryUnlocked(d.day, unlockMax, isDemo));
    const orphan =
      (view.name === "result" || view.name === "reward") &&
      attempt?.discoveryId !== view.discoveryId;
    if (!open || orphan) home();
  }, [hydrated, view, progress.collected, unlockMax, isDemo, attempt, home]);

  // Warm the flow while the visitor reads Home.
  useEffect(() => {
    if (!hydrated || view.name !== "home") return;
    return whenIdle(() => void loadLessonArt(featured.id));
  }, [hydrated, view.name, featured.id]);

  const start = (id: DiscoveryId) => {
    if (!progress.introDismissed) dispatch({ type: "dismissIntro" });
    setJustCollected(null);
    void loadLessonArt(id);
    go(() => push({ name: "lesson", discoveryId: id, step: 1 }));
  };

  const goHome = () => go(home);

  const openBadges = () => setBadgesOpen(true);
  const onBadgesOpenChange = (open: boolean) => {
    setBadgesOpen(open);
    if (!open) {
      const unseen = getUnseenBadges(progress);
      if (unseen.length) dispatch({ type: "markBadgesSeen", badgeIds: unseen });
    }
  };

  const onBadgeMoment = () => {
    if (attempt?.outcome.newBadges.length)
      setBadgeQueue(attempt.outcome.newBadges.map((b) => b.id));
  };

  const onBadgeDone = () => {
    const [current, ...rest] = badgeQueue;
    if (current) dispatch({ type: "markBadgesSeen", badgeIds: [current] });
    setBadgeQueue(rest);
  };

  const announce =
    view.name === "lesson" && active
      ? copy.aria.stepAnnounce(
          Math.min(view.step, active.steps.length),
          active.steps.length,
          active.steps[Math.min(view.step, active.steps.length) - 1].title,
        )
      : "";

  const renderView = (v: ViewState) => {
    if (v.name === "home" || !active) {
      return (
        <HomeView
          progress={progress}
          todayKey={todayKey}
          isDemo={isDemo}
          justCollected={justCollected}
          onStart={start}
          onOpenBadges={openBadges}
          onOpenShop={() => setShopOpen(true)}
          onOpenMenu={() => setMenuOpen(true)}
          onShare={(id) => setShareId(id)}
        />
      );
    }
    switch (v.name) {
      case "lesson":
        return (
          <LessonView
            discovery={active}
            step={v.step}
            reduced={flags.calm}
            lite={flags.lite}
            visible={flags.visible}
            hinglish={progress.settings.hinglish}
            onHinglishChange={(value) =>
              dispatch({ type: "setSetting", key: "hinglish", value })
            }
            onStep={(step) => replace({ name: "lesson", discoveryId: active.id, step })}
            onClose={goHome}
            onTest={() => {
              setTestKey((k) => k + 1);
              go(() => push({ name: "test", discoveryId: active.id }));
            }}
          />
        );
      case "test":
        return (
          <TestView
            key={`${active.id}-${testKey}`}
            discovery={active}
            attemptNumber={(progress.attempts[active.id] ?? 0) + 1}
            haptics={progress.settings.haptics}
            onFinish={(score, results) => {
              const outcome = finishTest(active.id, score);
              setAttempt({ discoveryId: active.id, results, outcome });
            }}
            onSeeResult={() => {
              if (!attempt) return;
              go(() =>
                replace({
                  name: attempt.outcome.isPassing ? "reward" : "result",
                  discoveryId: active.id,
                }),
              );
            }}
            onClose={goHome}
          />
        );
      case "result":
        return attempt ? (
          <ResultView
            discovery={active}
            results={attempt.results}
            pointsEarned={attempt.outcome.pointsEarned}
            onRetry={() => {
              setTestKey((k) => k + 1);
              go(() => replace({ name: "test", discoveryId: active.id }));
            }}
            onLesson={() =>
              go(() => replace({ name: "lesson", discoveryId: active.id, step: 1 }))
            }
            onClose={goHome}
          />
        ) : null;
      case "reward":
        return attempt ? (
          <RewardView
            discovery={active}
            outcome={attempt.outcome}
            totalPoints={progress.points}
            calm={flags.calm}
            lite={flags.lite}
            haptics={progress.settings.haptics}
            onBadgeMoment={onBadgeMoment}
            onContinue={() => {
              setJustCollected(attempt.outcome.isFirstCollect ? active.id : null);
              goHome();
            }}
          />
        ) : null;
    }
  };

  return (
    <AppFrame ready={hydrated}>
      <ViewErrorBoundary key={view.name} onHome={home}>
        {renderView(view)}
      </ViewErrorBoundary>
      <Toaster />
      <LiveRegion message={announce} />
      <BadgeSheet
        open={badgesOpen}
        onOpenChange={onBadgesOpenChange}
        progress={progress}
        onOpenShop={() => setShopOpen(true)}
      />
      <ShopSheet
        open={shopOpen}
        onOpenChange={setShopOpen}
        progress={progress}
        username={user?.username ?? null}
        onNeedAuth={() => {
          setShopOpen(false);
          setAuthOpen(true);
        }}
        onRedeem={(itemId) => {
          if (!user) {
            setShopOpen(false);
            setAuthOpen(true);
            return;
          }
          const item = getShopItem(itemId);
          if (
            !item ||
            !canRedeem(item, progress.points, progress.spentPoints ?? 0)
          ) {
            toast(copy.shop.notEnough);
            return;
          }
          dispatch({
            type: "redeemShopItem",
            itemId,
            username: user.username,
            nowIso: new Date().toISOString(),
          });
          toast(copy.shop.redeemedToast(item.brand));
        }}
      />
      <MenuSheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        progress={progress}
        user={user}
        onSetting={(key, value) => dispatch({ type: "setSetting", key, value })}
        onLoginPress={() => setAuthOpen(true)}
        onLogout={() => {
          detachAccount();
          logout();
        }}
        onRename={rename}
      />
      <AuthSheet
        open={authOpen}
        onOpenChange={setAuthOpen}
        onRegister={async (username, password) => {
          const result = await register(username, password);
          if (result.ok) attachAccount(username);
          return result;
        }}
        onLogin={async (username, password) => {
          const result = await login(username, password);
          if (result.ok) attachAccount(username);
          return result;
        }}
      />
      <ShareAchievementSheet
        open={Boolean(shareId && shareDiscovery)}
        onOpenChange={(open) => {
          if (!open) setShareId(null);
        }}
        discovery={shareDiscovery ?? null}
        score={shareId ? (progress.collected[shareId]?.score ?? 4) : 4}
        user={user}
        dark={progress.settings.darkMode}
        onNeedAuth={() => {
          setShareId(null);
          setAuthOpen(true);
        }}
      />
      <NewBadgeDialog badge={badgeQueue[0] ?? null} onDone={onBadgeDone} />
    </AppFrame>
  );
}
