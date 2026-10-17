"use client";

import { useCalmMotion } from "@/hooks/useCalmMotion";
import { cn } from "@/lib/utils";
import { LazyMotion, MotionConfig, domMax } from "motion/react";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  topBar: ReactNode;
  bottomBar: ReactNode;
  /** From progress.settings.calmMotion */
  calmMotion?: boolean;
};

const loadFeatures = () =>
  Promise.resolve(domMax);

/**
 * AppShell: the museum frame.
 * On desktop (>= 430px viewport) it shows a centered 430px column with 32px
 * rounded corners and a warm background extending to the window edges.
 * On mobile it fills the full screen.
 * Wraps all motion with MotionConfig to respect reduced-motion preferences.
 */
export function AppShell({
  children,
  topBar,
  bottomBar,
  calmMotion = false,
}: AppShellProps) {
  const isCalm = useCalmMotion(calmMotion);

  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={isCalm ? "always" : "user"}>
        <div className="min-h-dvh w-full bg-[oklch(0.919_0.028_79.18)] flex items-start justify-center">
          <div
            className={cn(
              "relative flex min-h-dvh w-full flex-col overflow-hidden",
              "bg-background",
              "sm:min-h-[min(100dvh,900px)] sm:my-auto sm:max-w-[430px] sm:rounded-[32px]",
              "sm:shadow-[0_8px_32px_oklch(0.196_0.017_48.56_/_0.10),0_2px_8px_oklch(0.196_0.017_48.56_/_0.06)]",
            )}
          >
            {topBar}

            <main className="relative flex flex-1 flex-col overflow-hidden">
              {children}
            </main>

            {bottomBar}
          </div>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
