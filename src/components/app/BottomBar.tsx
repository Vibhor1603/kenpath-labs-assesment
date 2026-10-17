import type { ReactNode } from "react";

/** Thumb zone. 72px plus the safe area; every main action lives here. */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <footer
      className="bg-surface relative z-20 flex shrink-0 items-center gap-2 px-[max(16px,env(safe-area-inset-left))] pt-2 pb-[max(8px,env(safe-area-inset-bottom))] shadow-[0_-1px_0_var(--line)]"
      style={{
        minHeight: "calc(72px + env(safe-area-inset-bottom))",
        viewTransitionName: "bottombar",
      }}
    >
      {children}
    </footer>
  );
}
