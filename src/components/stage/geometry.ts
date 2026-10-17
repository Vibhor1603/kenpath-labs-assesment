import type { Camera, Label } from "@/content/types";

export type Size = { w: number; h: number };
export type Point = { x: number; y: number };
export type Rect = { x: number; y: number; w: number; h: number };

export const STAGE_INSET = 16;
const LABEL_GAP = 34;
const PILL_H = 30;
const CHAR_W = 7.6;
const PILL_PAD = 26;

/** Scale that fits the art's viewBox into the stage with a safe inset. */
export function fitScale(stage: Size, art: Size): number {
  return Math.min(
    (stage.w - STAGE_INSET * 2) / art.w,
    (stage.h - STAGE_INSET * 2) / art.h,
  );
}

/** Maps an art point to stage pixels for a camera that centres `camera` and zooms by `camera.scale`. */
export function project(p: Point, stage: Size, fit: number, camera: Camera): Point {
  const k = fit * camera.scale;
  return { x: stage.w / 2 + (p.x - camera.x) * k, y: stage.h / 2 + (p.y - camera.y) * k };
}

/** The part of the stage the art may use: everything above `insetBottom`. */
export function viewport(stage: Size, insetBottom: number): Size {
  return { w: stage.w, h: Math.max(0, stage.h - insetBottom) };
}

/** CSS transform for the art wrapper (transform-origin is its centre). */
export function cameraTransform(art: Size, fit: number, camera: Camera): string {
  const tx = -(camera.x - art.w / 2) * fit * camera.scale;
  const ty = -(camera.y - art.h / 2) * fit * camera.scale;
  return `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0) scale(${camera.scale})`;
}

export type PlacedLabel = {
  label: Label;
  anchor: Point;
  pill: Rect;
  line: { x1: number; y1: number; x2: number; y2: number; len: number } | null;
};

function overlaps(a: Rect, b: Rect, pad = 6): boolean {
  return (
    a.x < b.x + b.w + pad &&
    b.x < a.x + a.w + pad &&
    a.y < b.y + b.h + pad &&
    b.y < a.y + a.h + pad
  );
}

function closestPointOnRect(p: Point, r: Rect): Point {
  return {
    x: Math.min(Math.max(p.x, r.x), r.x + r.w),
    y: Math.min(Math.max(p.y, r.y), r.y + r.h),
  };
}

/**
 * Places label pills around their anchors, keeps them inside the safe box and
 * pushes later pills away from earlier ones. Text stays unscaled in screen space.
 */
export function placeLabels(
  labels: Label[],
  stage: Size,
  fit: number,
  camera: Camera,
  bottomSafe: number,
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];
  const minX = STAGE_INSET;
  const maxX = stage.w - STAGE_INSET;
  const minY = 12;
  const maxY = stage.h - bottomSafe;

  for (const label of labels) {
    const anchor = project(label.anchor, stage, fit, camera);
    const w = Math.round(label.text.length * CHAR_W + PILL_PAD);
    const h = PILL_H;
    let x = anchor.x - w / 2;
    let y = anchor.y - h / 2;
    if (label.side === "left") x = anchor.x - LABEL_GAP - w;
    if (label.side === "right") x = anchor.x + LABEL_GAP;
    if (label.side === "top") y = anchor.y - LABEL_GAP - h;
    if (label.side === "bottom") y = anchor.y + LABEL_GAP;

    const clamp = () => {
      x = Math.min(Math.max(x, minX), maxX - w);
      y = Math.min(Math.max(y, minY), maxY - h);
    };
    clamp();

    for (let tries = 0; tries < 4; tries++) {
      const hit = placed.find((p) => overlaps(p.pill, { x, y, w, h }));
      if (!hit) break;
      const below = hit.pill.y + hit.pill.h + 8;
      const above = hit.pill.y - h - 8;
      y = below + h <= maxY ? below : above;
      clamp();
    }

    const pill = { x: Math.round(x), y: Math.round(y), w, h };
    const end = closestPointOnRect(anchor, pill);
    const len = Math.hypot(end.x - anchor.x, end.y - anchor.y);
    placed.push({
      label,
      anchor,
      pill,
      line: len > 6 ? { x1: anchor.x, y1: anchor.y, x2: end.x, y2: end.y, len } : null,
    });
  }
  return placed;
}
