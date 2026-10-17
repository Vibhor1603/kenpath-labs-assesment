import { flushSync } from "react-dom";

type StartViewTransition = (update: () => void) => { finished: Promise<void> };

/**
 * Runs a navigation inside a View Transition when the browser supports it and
 * motion is welcome. The update is flushed synchronously so the browser can
 * snapshot the new view in the same frame. Otherwise the update runs as is.
 */
export function navigateWithTransition(update: () => void, animate: boolean): void {
  const start = (document as Document & { startViewTransition?: StartViewTransition })
    .startViewTransition;
  if (!animate || typeof start !== "function") {
    update();
    return;
  }
  start.call(document, () => flushSync(update));
}
