import type { CSSProperties } from "react";
import type { PartPose } from "@/content/types";
import { stepTimeline } from "@/lib/motion";

/** Opacity for parts that are not the focus of the current step. */
export const DIM = 0.32;
/** Opacity for structural context when not in focus: present, but quiet. */
export const CONTEXT = 0.48;

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
 * Style for a movable `<g>`.
 * Focused parts stay full color. Everything else goes grayscale + dim so the
 * explained part is obvious. Only opacity is transitioned (device-safe);
 * grayscale snaps on or off with the step.
 */
export function partStyle(
  id: string,
  ctx: PartContext,
  origin = "50% 50%",
): CSSProperties {
  const pose = ctx.pose[id];
  // Empty focus = "show the whole system" (final recap steps).
  const showAll = ctx.focus.length === 0;
  const isFocus = showAll || ctx.focus.includes(id);
  const baseOpacity = ctx.hidden.has(id)
    ? 0
    : isFocus
      ? 1
      : ctx.context?.has(id)
        ? CONTEXT
        : DIM;
  const opacity = pose?.opacity ?? baseOpacity;
  const hidden = opacity <= 0.01;

  const transforms: string[] = [];
  if (pose?.x || pose?.y)
    transforms.push(`translate(${pose.x ?? 0}px, ${pose.y ?? 0}px)`);
  if (pose?.rotate) transforms.push(`rotate(${pose.rotate}deg)`);
  if (pose?.scale && pose.scale !== 1) transforms.push(`scale(${pose.scale})`);

  const focusDelay = stepTimeline.focusAtMs;
  return {
    opacity,
    // Grayscale is set, never transitioned — only opacity eases.
    filter: hidden || isFocus || showAll ? "none" : "grayscale(1)",
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
    "data-focus":
      ctx.focus.length === 0 || ctx.focus.includes(id) ? "1" : "0",
    style: partStyle(id, ctx, origin),
  });
}
