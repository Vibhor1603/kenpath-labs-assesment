"use client";

import dynamic from "next/dynamic";
import { BottomBar } from "@/components/app/BottomBar";
import { SketchLoader } from "@/components/app/SketchLoader";
import { FlowTopBar } from "@/components/app/TopBar";
import { Stage } from "@/components/stage/Stage";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import { sourceIds, sources } from "@/content/index";
import type { Discovery, LessonArtModule } from "@/content/types";
import { getLoadedLessonArt, loadLessonArt } from "@/lib/lessonArt";
import { stepTimeline } from "@/lib/motion";
import { ArrowLeft, ChevronUp, ExternalLink, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

const Sheet = dynamic(() => import("@/components/ui/sheet").then((m) => m.Sheet), {
  ssr: false,
});

function useLessonArt(id: Discovery["id"]): LessonArtModule | null {
  const [mod, setMod] = useState<LessonArtModule | null>(() => getLoadedLessonArt(id));
  useEffect(() => {
    if (mod) return;
    let alive = true;
    loadLessonArt(id).then((m) => {
      if (alive) setMod(m);
    });
    return () => {
      alive = false;
    };
  }, [id, mod]);
  return mod;
}

const PANEL_OVERLAP = 20;
const LEGEND_ROW = 30;

type LessonViewProps = {
  discovery: Discovery;
  step: number;
  reduced: boolean;
  lite: boolean;
  visible: boolean;
  hinglish: boolean;
  onHinglishChange: (value: boolean) => void;
  onStep: (step: number) => void;
  onClose: () => void;
  onTest: () => void;
};

export default function LessonView({
  discovery,
  step,
  reduced,
  lite,
  visible,
  hinglish,
  onHinglishChange,
  onStep,
  onClose,
  onTest,
}: LessonViewProps) {
  const total = discovery.steps.length;
  const index = Math.min(Math.max(step, 1), total) - 1;
  const raw = discovery.steps[index];
  const current =
    hinglish && raw.hinglish
      ? {
          ...raw,
          title: raw.hinglish.title,
          body: raw.hinglish.body,
          beats: raw.hinglish.beats ?? raw.beats,
          more: raw.hinglish.more ?? raw.more,
        }
      : raw;
  const isLast = index === total - 1;
  const art = useLessonArt(discovery.id);
  const [replayKey, setReplayKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const go = (dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0) return;
    if (next >= total) {
      onTest();
      return;
    }
    onStep(next + 1);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (moreOpen || e.altKey || e.metaKey || e.ctrlKey) return;
      if (e.key === "ArrowRight") onStep(Math.min(total, index + 2));
      if (e.key === "ArrowLeft" && index > 0) onStep(index);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, total, moreOpen, onStep]);

  const showLegend = Boolean(art?.legend && art.legendSteps?.includes(index));
  const note = art?.notes?.[index];
  // The text panel overlaps the stage by 20px; a lesson with a colour key keeps one row free for it.
  const insetBottom = PANEL_OVERLAP + (art?.legend ? LEGEND_ROW : 0);
  const words = current.title.split(" ");
  const textKey = `${current.id}-${replayKey}`;
  const lessonSources = sources.filter((s) => sourceIds[discovery.id].includes(s.id));

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-domain={discovery.domain}>
      <FlowTopBar
        current={index + 1}
        total={total}
        done={index + 1}
        onClose={onClose}
        closeLabel={copy.lesson.close}
      />

      <div
        className="relative shrink-0"
        style={{ height: "clamp(260px, calc(58svh - 56px), 560px)" }}
      >
        {art ? (
          <Stage
            idPrefix={`lesson-${discovery.id}`}
            step={current}
            stepIndex={index}
            replayKey={replayKey}
            Art={art.default}
            viewBox={art.viewBox}
            reduced={reduced}
            lite={lite}
            playing={visible && !paused}
            insetBottom={insetBottom}
            onSwipe={go}
            overlay={
              showLegend && art.legend ? (
                <ul
                  key={`legend-${discovery.id}`}
                  className="anim-fade-in pointer-events-none absolute inset-x-2 flex items-center justify-center gap-x-2.5 whitespace-nowrap"
                  style={{ bottom: PANEL_OVERLAP + 6, height: LEGEND_ROW - 8 }}
                  aria-label="Colour key"
                >
                  {art.legend.map((item) => (
                    <li
                      key={item.label}
                      className="text-caption text-ink flex items-center gap-1.5 font-semibold"
                    >
                      <span
                        className="size-2 rounded-full ring-1 ring-black/10"
                        style={{ background: item.color }}
                      />
                      {item.label}
                    </li>
                  ))}
                </ul>
              ) : null
            }
          />
        ) : (
          <div className="bg-domain-tint/60 absolute inset-0">
            <SketchLoader id={discovery.id} />
          </div>
        )}
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? copy.lesson.play : copy.lesson.pause}
          aria-pressed={paused}
          className="pressable text-ink-soft hover:text-ink absolute top-2 right-3 z-10 inline-flex size-12 items-center justify-center rounded-full"
        >
          <span className="bg-surface/90 ring-line inline-flex size-9 items-center justify-center rounded-full ring-1">
            {paused ? (
              <Play className="size-4" aria-hidden="true" />
            ) : (
              <Pause className="size-4" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>

      <section className="bg-surface relative z-10 -mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[24px] px-4 pt-4 shadow-[0_-1px_0_var(--line),0_-16px_32px_-24px_rgb(23_24_28/0.35)]">
        <div className="flex items-center justify-between gap-2">
          <p className="eyebrow text-domain" aria-hidden="true">
            {copy.lesson.stepOf(index + 1, total)}
          </p>
          <div
            className="bg-sunk inline-flex rounded-full p-0.5"
            role="group"
            aria-label={copy.home.hinglishLabel}
          >
            <button
              type="button"
              className={
                hinglish
                  ? "text-ink-soft rounded-full px-2.5 py-1 text-[12px] font-semibold"
                  : "bg-surface text-ink rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-[var(--shadow-sm)]"
              }
              aria-pressed={!hinglish}
              onClick={() => onHinglishChange(false)}
            >
              {copy.lesson.englishToggle}
            </button>
            <button
              type="button"
              className={
                hinglish
                  ? "bg-surface text-ink rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-[var(--shadow-sm)]"
                  : "text-ink-soft rounded-full px-2.5 py-1 text-[12px] font-semibold"
              }
              aria-pressed={hinglish}
              onClick={() => onHinglishChange(true)}
            >
              {copy.lesson.hinglishToggle}
            </button>
          </div>
        </div>
        <h2 key={`t-${textKey}`} className="text-title mt-1.5">
          {words.map((w, i) => (
            <span key={i}>
              <span
                className="anim-rise-in inline-block"
                style={{
                  animationDelay: `${stepTimeline.titleAtMs + i * stepTimeline.wordStaggerMs}ms`,
                }}
              >
                {w}
              </span>
              {i < words.length - 1 ? " " : null}
            </span>
          ))}
        </h2>
        <div
          key={`b-${textKey}`}
          className="anim-fade-in mt-1.5 min-h-0 flex-1 overflow-y-auto pb-1"
          style={{
            animationDelay: `${stepTimeline.titleAtMs + words.length * stepTimeline.wordStaggerMs + stepTimeline.bodyDelayMs}ms`,
          }}
        >
          <p className="text-body text-ink-soft">{current.body}</p>
          {current.beats && current.beats.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {current.beats.map((beat) => (
                <li
                  key={beat}
                  className="text-body text-ink flex gap-2.5 leading-snug"
                >
                  <span
                    className="bg-domain mt-2 size-1.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                  <span>{beat}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {note ? (
            <p className="text-caption text-ink-soft mt-3">{note}</p>
          ) : null}
        </div>
        <div className="mt-auto flex items-center pb-1.5">
          <Button
            variant="quiet"
            size="md"
            className="text-ink-soft -ml-3"
            onClick={() => setMoreOpen(true)}
          >
            {copy.lesson.learnMore}
            <ChevronUp aria-hidden="true" />
          </Button>
        </div>
      </section>

      <BottomBar>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label={copy.lesson.back}
        >
          <ArrowLeft aria-hidden="true" />
        </Button>
        <Button className="flex-1" onClick={() => go(1)}>
          {isLast ? copy.lesson.takeTheTest : copy.lesson.next}
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setReplayKey((k) => k + 1)}
          aria-label={copy.lesson.replay}
        >
          <RotateCcw aria-hidden="true" />
        </Button>
      </BottomBar>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen} title={current.title}>
        <p className="text-body text-ink">{current.more ?? current.body}</p>
        <h3 className="text-caption text-ink-soft mt-6 font-semibold tracking-[0.06em] uppercase">
          {copy.lesson.sourcesHeading}
        </h3>
        <ul className="mt-2 flex flex-col pb-2">
          {lessonSources.map((s) => (
            <li key={s.id}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="border-line text-small text-ink flex min-h-12 items-center justify-between gap-3 border-b py-2 font-semibold"
              >
                {s.title}
                <ExternalLink
                  className="text-ink-soft size-4 shrink-0"
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>
      </Sheet>
    </div>
  );
}
