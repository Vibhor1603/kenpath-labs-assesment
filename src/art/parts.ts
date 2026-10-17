import type { CSSProperties } from "react";
import type { PartPose } from "@/content/types";
import { stepTimeline } from "@/lib/motion";

/** Opacity for parts that are not the focus of the current step. */
export const DIM = 0.28;
/** Opacity for structural context (cabinet, blade, chambers) when not in focus: present, but quiet. */
export const CONTEXT = 0.62;

export type PartContext = {
  focus: string[];
  pose: Record<string, PartPose>;
  reduced: boolean;
  /** Parts that are hidden unless a step's pose turns them on. */
  hidden: ReadonlySet<string>;
  /** Structural parts that dim less when out of focus. */
  context?: ReadonlySet<string>;
};

/**
 * Style for a movable `<g>`. Opacity comes from the step pose, else focus.
 * Transitions retarget from the current value, so a fast tap never queues.
 */
export function partStyle(
  id: string,
  ctx: PartContext,
  origin = "50% 50%",
): CSSProperties {
  const pose = ctx.pose[id];
  const isFocus = ctx.focus.length === 0 || ctx.focus.includes(id);
  const baseOpacity = ctx.hidden.has(id)
    ? 0
    : isFocus
      ? 1
      : ctx.context?.has(id)
        ? CONTEXT
        : DIM;
  const opacity = pose?.opacity ?? baseOpacity;

  const transforms: string[] = [];
  if (pose?.x || pose?.y)
    transforms.push(`translate(${pose.x ?? 0}px, ${pose.y ?? 0}px)`);
  if (pose?.rotate) transforms.push(`rotate(${pose.rotate}deg)`);
  if (pose?.scale && pose.scale !== 1) transforms.push(`scale(${pose.scale})`);

  const focusDelay = stepTimeline.focusAtMs;
  return {
    opacity,
    transform: transforms.length ? transforms.join(" ") : "none",
    transformBox: "fill-box",
    transformOrigin: origin,
    transition: ctx.reduced
      ? `opacity ${stepTimeline.reducedFadeMs}ms var(--ease-out), transform 0ms`
      : `opacity ${stepTimeline.focusMs}ms var(--ease-out) ${focusDelay}ms, transform 700ms var(--spring-soft)`,
  };
}

/** Shorthand used by every art file. */
export function makePart(ctx: PartContext) {
  return (id: string, origin?: string) => ({
    "data-part": id,
    style: partStyle(id, ctx, origin),
  });
}
