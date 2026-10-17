"use client";

import { BottomBar } from "@/components/app/BottomBar";
import { Exhibit } from "@/components/app/Exhibit";
import { Sprout } from "@/components/app/Sprout";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import type { Discovery, TestOutcome } from "@/content/types";
import { ScoreFires } from "@/components/app/ScoreFires";
import { useCountUp } from "@/hooks/useCountUp";
import { burstConfetti, playPopBursts, shouldCelebrate } from "@/lib/confetti";
import { vibrateReward } from "@/lib/haptics";
import { reward } from "@/lib/motion";
import { Check } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type RewardViewProps = {
  discovery: Discovery;
  outcome: TestOutcome;
  totalPoints: number;
  calm: boolean;
  lite: boolean;
  haptics: boolean;
  /** Fires at the moment a new badge should appear (or right away when skipped). */
  onBadgeMoment: () => void;
  onContinue: () => void;
};

const SPARK_COLORS = ["#C8963F", "#E9A15B", "#2C6680", "#386B43", "#A23A4D", "#F2D27A"];

/** Ten paper-cut sparks on fixed polar coordinates (no randomness, so renders stay pure). */
const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const angle = ((200 + (i * 140) / 9) * Math.PI) / 180;
  const dist = 92 + ((i * 37) % 5) * 12;
  return {
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    rot: (i % 2 ? 1 : -1) * (120 + i * 18),
    ms: 560 + ((i * 53) % 4) * 70,
    color: SPARK_COLORS[i % SPARK_COLORS.length],
    round: i % 3 === 0,
  };
});

export default function RewardView({
  discovery,
  outcome,
  totalPoints,
  calm,
  lite,
  haptics,
  onBadgeMoment,
  onContinue,
}: RewardViewProps) {
  const [skipped, setSkipped] = useState(false);
  const instant = calm || skipped;
  const badgeFired = useRef(false);
  const onBadgeMomentRef = useRef(onBadgeMoment);
  const continueRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const pointsRef = useCountUp<HTMLSpanElement>(outcome.pointsEarned, {
    delayMs: reward.countAtMs,
    durationMs: reward.countMs,
    instant,
    prefix: "+",
  });

  useEffect(() => {
    vibrateReward(haptics);
    continueRef.current?.focus({ preventScroll: true });
    if (!shouldCelebrate({ calm, lite })) return;
    const host = rootRef.current;
    if (!host) return;
    burstConfetti(host, lite);
    playPopBursts(lite ? 3 : 6);
  }, [haptics, calm, lite]);

  useEffect(() => {
    onBadgeMomentRef.current = onBadgeMoment;
  }, [onBadgeMoment]);

  useEffect(() => {
    if (badgeFired.current) return;
    const fire = () => {
      if (badgeFired.current) return;
      badgeFired.current = true;
      onBadgeMomentRef.current();
    };
    if (instant) {
      fire();
      return;
    }
    const t = setTimeout(fire, reward.badgeAtMs);
    return () => clearTimeout(t);
  }, [instant]);

  const domain = copy.domains[discovery.domain];
  const sparks = !lite && !calm && !skipped;
  const streakLine =
    outcome.streakAfter > outcome.streakBefore
      ? copy.streak.kept(outcome.streakAfter)
      : outcome.streakAfter > 0
        ? `Day ${outcome.streakAfter} in a row.`
        : copy.streak.broken;

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-0 flex-1 flex-col"
      data-domain={discovery.domain}
      data-skip={skipped ? "" : undefined}
      onPointerDown={() => setSkipped(true)}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 30%, var(--brass-tint) 0%, color-mix(in oklch, var(--brass-tint), var(--canvas) 60%) 45%, var(--canvas) 80%)",
          animation: "fade-in 400ms var(--ease-out) both",
        }}
        aria-hidden="true"
      />

      <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 pt-[env(safe-area-inset-top)] text-center">
        <div className="relative h-[230px] w-full" aria-hidden="true">
          <span
            className="reward-bloom absolute top-1/2 left-1/2 size-[280px] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgb(255 253 248 / 0.95), rgb(255 253 248 / 0))",
            }}
          />
          <span className="hairline-floor absolute inset-x-16 bottom-3" />
          <span className="reward-pop absolute inset-x-0 top-2 bottom-4 flex justify-center">
            <Exhibit
              id={discovery.id}
              idPrefix={`reward-${discovery.id}`}
              className="h-full w-auto"
            />
          </span>
          {sparks ? (
            <span className="absolute top-1/2 left-1/2">
              {SPARKS.map((s, i) => (
                <span
                  key={i}
                  className="absolute block"
                  style={
                    {
                      "--dx": `${s.dx.toFixed(1)}px`,
                      "--dy": `${s.dy.toFixed(1)}px`,
                      "--rot": `${s.rot}deg`,
                      animation: `spark ${s.ms}ms var(--ease-out) ${220 + i * 16}ms both`,
                    } as CSSProperties
                  }
                >
                  <span
                    className="block"
                    style={{
                      width: s.round ? 8 : 6,
                      height: s.round ? 8 : 12,
                      borderRadius: s.round ? 999 : 2,
                      background: s.color,
                    }}
                  />
                </span>
              ))}
            </span>
          ) : null}
        </div>

        <div
          className="anim-rise-in bg-surface ring-line relative mt-4 w-full max-w-[300px] rounded-[22px] px-6 pt-4 pb-5 shadow-[var(--shadow-md)] ring-1"
          style={{ animationDelay: "380ms" }}
        >
          <p className="tabular eyebrow text-domain">
            {discovery.catalogNo} · {domain}
          </p>
          <p className="font-display text-title mt-1 font-semibold">
            {discovery.shortName}
          </p>
          <span
            className="reward-stamp border-brass-ink bg-surface font-display text-brass-ink absolute -top-4 -right-3 inline-flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-[15px] font-semibold tracking-[0.08em] uppercase"
            style={{ animationDelay: `${reward.stampAtMs}ms` }}
          >
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            {copy.reward.stamp}
          </span>
        </div>

        <h1
          className="anim-rise-in text-title-s mt-5"
          style={{ animationDelay: "520ms" }}
        >
          {copy.reward.understand[discovery.id]}
        </h1>
        <div className="anim-rise-in mt-3" style={{ animationDelay: "560ms" }}>
          <ScoreFires score={outcome.score} />
        </div>

        {outcome.pointsEarned > 0 ? (
          <div
            className="anim-rise-in mt-5 flex flex-col items-center"
            style={{ animationDelay: "640ms" }}
          >
            <span
              ref={pointsRef}
              className="tabular font-display text-hero text-brass-ink font-semibold"
            >
              +0
            </span>
            <span className="text-caption text-ink-soft mt-1 font-semibold tracking-[0.06em] uppercase">
              {copy.reward.pointsLabel} · {copy.reward.total(totalPoints)}
            </span>
            {outcome.breakdown.discovery > 0 || outcome.breakdown.streak > 0 ? (
              <ul className="text-small text-ink-soft mt-2.5 space-y-0.5 text-center">
                {outcome.breakdown.discovery > 0 ? (
                  <li>{copy.reward.discoveryLine(outcome.breakdown.discovery)}</li>
                ) : null}
                {outcome.breakdown.streak > 0 ? (
                  <li>
                    {copy.reward.streakLine(
                      outcome.breakdown.streak,
                      outcome.streakAfter,
                    )}
                  </li>
                ) : null}
              </ul>
            ) : null}
            {outcome.isRevisit ? (
              <span className="text-caption text-ink-soft mt-1.5">{copy.reward.revisitNote}</span>
            ) : null}
          </div>
        ) : null}

        <p
          className="anim-rise-in text-small text-ink-soft mt-4 inline-flex items-center gap-1.5"
          style={{ animationDelay: "760ms" }}
        >
          <Sprout count={outcome.streakAfter} grow={!instant} className="size-7" />
          {streakLine}
        </p>
      </main>

      <BottomBar>
        <Button ref={continueRef} className="flex-1" onClick={onContinue}>
          {copy.reward.continue}
        </Button>
      </BottomBar>
    </div>
  );
}
