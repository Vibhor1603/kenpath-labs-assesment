"use client";

import {
  cameraTransform,
  fitScale,
  placeLabels,
  viewport,
  type Size,
} from "@/components/stage/geometry";
import { StageLabels } from "@/components/stage/StageLabels";
import type { Camera, LessonArtProps, Step } from "@/content/types";
import { stepTimeline } from "@/lib/motion";
import { swipe } from "@/lib/tokens";
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type PointerEvent,
  type ReactNode,
} from "react";

type StageProps = {
  idPrefix: string;
  step: Step;
  stepIndex: number;
  replayKey: number;
  Art: ComponentType<LessonArtProps>;
  viewBox: Size;
  reduced: boolean;
  lite: boolean;
  playing: boolean;
  /** Stage height covered by the text panel and the colour key. Art and labels stay above it. */
  insetBottom?: number;
  onSwipe: (direction: 1 | -1) => void;
  overlay?: ReactNode;
};

type Drag = {
  id: number;
  x0: number;
  y0: number;
  t0: number;
  horizontal: boolean | null;
  dx: number;
};

export function Stage({
  idPrefix,
  step,
  stepIndex,
  replayKey,
  Art,
  viewBox,
  reduced,
  lite,
  playing,
  insetBottom = 0,
  onSwipe,
  overlay,
}: StageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const swipeRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const cameraRef = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize((prev) =>
        prev && Math.abs(prev.w - r.width) < 1 && Math.abs(prev.h - r.height) < 1
          ? prev
          : { w: r.width, h: r.height },
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => setAnimated(true)),
    );
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  const overview: Camera = { x: viewBox.w / 2, y: viewBox.h / 2, scale: 1 };
  const camera = step.camera ?? overview;
  const view = size ? viewport(size, insetBottom) : null;
  const fit = view ? fitScale(view, viewBox) : 0;

  // Replay: jump to the overview, then travel back to this step's camera.
  useLayoutEffect(() => {
    const el = cameraRef.current;
    if (replayKey === 0 || !el || reduced || !size) return;
    const target = el.style.transform;
    el.style.transition = "none";
    el.style.transform = cameraTransform(viewBox, fit, overview);
    void el.getBoundingClientRect();
    el.style.transition = `transform ${stepTimeline.cameraMs}ms var(--spring-soft)`;
    el.style.transform = target;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey]);

  const placed = useMemo(
    () => (view ? placeLabels(step.labels, view, fit, step.camera ?? overview, 8) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [view?.w, view?.h, fit, step],
  );

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current || (e.pointerType === "mouse" && e.button !== 0)) return;
    dragRef.current = {
      id: e.pointerId,
      x0: e.clientX,
      y0: e.clientY,
      t0: e.timeStamp,
      horizontal: null,
      dx: 0,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (d.horizontal === null && Math.hypot(dx, dy) > 8) {
      d.horizontal = Math.abs(dx) > Math.abs(dy);
      if (d.horizontal) e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.horizontal) return;
    d.dx = dx;
    const el = swipeRef.current;
    if (el) {
      el.style.transition = "none";
      el.style.transform = `translate3d(${(dx * swipe.elastic).toFixed(1)}px, 0, 0)`;
    }
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d || d.id !== e.pointerId) return;
    dragRef.current = null;
    const el = swipeRef.current;
    if (el) {
      el.style.transition = "transform 320ms var(--spring-press)";
      el.style.transform = "translate3d(0, 0, 0)";
    }
    if (!d.horizontal) return;
    const velocity = d.dx / Math.max(1, e.timeStamp - d.t0);
    if (d.dx < -swipe.offsetPx || velocity < -swipe.velocity) onSwipe(1);
    else if (d.dx > swipe.offsetPx || velocity > swipe.velocity) onSwipe(-1);
  };

  const artW = viewBox.w * fit;
  const artH = viewBox.h * fit;
  const moving = animated && !reduced;

  return (
    <div
      ref={stageRef}
      className="relative h-full w-full touch-pan-y overflow-hidden select-none"
      data-paused={playing ? undefined : ""}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 30% 18%, var(--surface) 0%, var(--domain-tint) 62%, color-mix(in oklch, var(--domain-tint), var(--sunk) 45%) 100%)",
        }}
        aria-hidden="true"
      />
      <div ref={swipeRef} className="absolute inset-0">
        {size && view ? (
          <>
            <div
              ref={cameraRef}
              className="absolute"
              style={{
                left: (view.w - artW) / 2,
                top: (view.h - artH) / 2,
                width: artW,
                height: artH,
                transform: cameraTransform(viewBox, fit, camera),
                transformOrigin: "50% 50%",
                transition: moving
                  ? `transform ${stepTimeline.cameraMs}ms var(--spring-soft)`
                  : "none",
                viewTransitionName: "exhibit",
              }}
            >
              <Art
                idPrefix={idPrefix}
                stepIndex={stepIndex}
                focus={step.partFocus}
                pose={step.pose}
                playing={playing}
                reduced={reduced}
                lite={lite}
              />
            </div>
            <StageLabels key={`${step.id}-${replayKey}`} placed={placed} stage={size} />
          </>
        ) : null}
      </div>
      {overlay}
    </div>
  );
}
