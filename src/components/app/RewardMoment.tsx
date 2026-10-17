"use client";

import { AnimatedNumber } from "@/components/motion/animated-number";
import { copy } from "@/content/copy";
import type { DiscoveryId, Badge } from "@/content/types";
import { getDiscovery } from "@/content/index";
import { spring, dur } from "@/lib/motion";
import { m, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { NewBadgeDialog } from "@/components/app/NewBadgeDialog";

type RewardMomentProps = {
  discoveryId: DiscoveryId;
  points: number;
  pointsEarned: number;
  streakAfter: number;
  newBadges: Badge[];
  onComplete: () => void;
};

/**
 * RewardMoment: the 1.6s reward sequence.
 * Butter overlay, stamp "Understood", points count-up, badge dialog.
 * A tap anywhere skips to completion.
 */
export function RewardMoment({
  discoveryId,
  points,
  pointsEarned,
  streakAfter,
  newBadges,
  onComplete,
}: RewardMomentProps) {
  const discovery = getDiscovery(discoveryId);
  const [phase, setPhase] = useState<"overlay" | "stamp" | "points" | "done">("overlay");
  const [showBadge, setShowBadge] = useState(false);
  const [badgeIndex, setBadgeIndex] = useState(0);
  const completedRef = useRef(false);

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (newBadges.length > 0) {
      setShowBadge(true);
    } else {
      onComplete();
    }
  };

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("stamp"), 200);
    const t2 = setTimeout(() => setPhase("points"), 700);
    const t3 = setTimeout(() => setPhase("done"), 1400);
    const t4 = setTimeout(finish, 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBadgeClose = () => {
    const nextIndex = badgeIndex + 1;
    if (nextIndex < newBadges.length) {
      setBadgeIndex(nextIndex);
    } else {
      setShowBadge(false);
      onComplete();
    }
  };

  const streakLine =
    streakAfter >= 1
      ? copy.streak.kept(streakAfter)
      : copy.streak.broken;

  const understandLine =
    discovery
      ? copy.reward.understand[discoveryId as keyof typeof copy.reward.understand] ??
        `You understand the ${discovery.shortName.toLowerCase()} now.`
      : "";

  return (
    <>
      <div
        className="flex flex-1 flex-col items-center justify-center relative overflow-hidden cursor-pointer"
        onClick={finish}
        role="button"
        aria-label="Skip reward animation"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && finish()}
      >
        {/* Butter warm overlay */}
        <m.div
          className="pointer-events-none absolute inset-0"
          style={{ background: "#F7E3A1" }}
          animate={{ opacity: phase === "overlay" ? 0.6 : 0.4 }}
          transition={{ duration: dur.ui }}
        />

        {/* Placard */}
        <m.div
          className="relative flex flex-col items-center gap-6 rounded-[24px] bg-card px-8 py-10 text-center"
          style={{
            boxShadow:
              "0 4px 24px oklch(0.196 0.017 48.56 / 0.10), 0 1px 6px oklch(0.196 0.017 48.56 / 0.06)",
          }}
          animate={{ scale: phase === "overlay" ? 1.02 : 1 }}
          transition={spring.ui}
        >
          {/* "Understood" stamp */}
          <AnimatePresence>
            {phase !== "overlay" && (
              <m.div
                initial={{ opacity: 0, scale: 1.08, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                transition={spring.press}
                className="absolute -top-5 left-1/2 -translate-x-1/2 rounded-[8px] border-4 border-primary px-4 py-1.5"
                style={{ rotate: "-2deg" }}
              >
                <span className="font-display text-[20px] font-[600] uppercase tracking-widest text-primary">
                  {copy.reward.stamp}
                </span>
              </m.div>
            )}
          </AnimatePresence>

          {/* Catalog line */}
          {discovery && (
            <p className="mt-4 text-[13px] font-medium uppercase tracking-widest text-muted-foreground">
              {copy.catalogLine(discovery.catalogNo, copy.domains[discovery.domain])}
            </p>
          )}

          {/* Discovery title */}
          {discovery && (
            <h1 className="font-display text-[26px] font-[600] leading-tight text-foreground">
              {discovery.shortName}
            </h1>
          )}

          {/* Understand line */}
          <p className="text-[17px] text-muted-foreground">{understandLine}</p>

          {/* Points count-up */}
          {phase !== "overlay" && (
            <m.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur.text, delay: 0.2 }}
              className="flex items-baseline gap-2"
            >
              <AnimatedNumber
                value={phase === "points" || phase === "done" ? points : points - pointsEarned}
                className="font-display text-[44px] font-[600] leading-none text-primary"
                springOptions={{ stiffness: 80, damping: 16 }}
              />
              <span className="text-[17px] text-muted-foreground">
                {copy.reward.pointsLabel}
              </span>
            </m.div>
          )}

          {/* Streak line */}
          {phase !== "overlay" && (
            <m.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: dur.text, delay: 0.4 }}
              className="text-[15px] text-muted-foreground"
            >
              {streakLine}
            </m.p>
          )}
        </m.div>
      </div>

      {/* Badge dialog */}
      <NewBadgeDialog
        badgeId={showBadge && newBadges[badgeIndex] ? newBadges[badgeIndex].id : null}
        onClose={handleBadgeClose}
      />
    </>
  );
}
