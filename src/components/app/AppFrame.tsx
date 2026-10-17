import type { ReactNode } from "react";

/**
 * Phone: the full dynamic viewport. Tablet and desktop: a 430px museum frame
 * with 32px corners on a quiet wall. The frame stays hidden for returning
 * visitors until saved progress is read, so the fresh state never flashes.
 */
export function AppFrame({ ready, children }: { ready: boolean; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center md:items-center md:py-6">
      <div
        data-app=""
        data-ready={ready ? "" : undefined}
        className="bg-canvas md:ring-line relative isolate flex h-dvh w-full max-w-[430px] flex-col overflow-hidden md:h-[min(932px,calc(100dvh-48px))] md:rounded-[32px] md:shadow-[var(--shadow-lg)] md:ring-1"
      >
        {children}
      </div>
    </div>
  );
}
