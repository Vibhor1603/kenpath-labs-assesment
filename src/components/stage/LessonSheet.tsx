"use client";

import { TextEffect } from "@/components/motion/text-effect";
import { copy } from "@/content/copy";
import { dur, ease } from "@/lib/motion";
import { m, useMotionValue, useTransform } from "motion/react";
import { useRef, useState } from "react";

type LessonSheetProps = {
  title: string;
  body: string;
  more?: string;
  stepId: string;
  showText: boolean;
};

const RESTING_Y = 0;
const LEARN_MORE_Y = -100;
const DISMISS_VELOCITY = 200;

/**
 * LessonSheet: the bottom text panel below the stage.
 * Two snap points: resting (shows title + body) and "learn more" (shows more text).
 * Drag y to snap between them. Paper grain, 24px rounded top corners.
 * Never covers more than 20% of the stage.
 */
export function LessonSheet({
  title,
  body,
  more,
  stepId,
  showText,
}: LessonSheetProps) {
  const y = useMotionValue(RESTING_Y);
  const [isExpanded, setIsExpanded] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  // Background slightly lightens when expanded
  const bgOpacity = useTransform(y, [LEARN_MORE_Y, RESTING_Y], [1, 0.98]);
  void bgOpacity;

  return (
    <m.div
      ref={dragRef}
      className="relative z-20 flex flex-col"
      style={{ y }}
      drag="y"
      dragConstraints={{
        top: LEARN_MORE_Y,
        bottom: RESTING_Y,
      }}
      dragElastic={0.1}
      onDragEnd={(_e, info) => {
        if (info.velocity.y < -DISMISS_VELOCITY || y.get() < LEARN_MORE_Y / 2) {
          setIsExpanded(true);
          y.set(LEARN_MORE_Y);
        } else {
          setIsExpanded(false);
          y.set(RESTING_Y);
        }
      }}
    >
      {/* Sheet surface */}
      <div
        className="rounded-t-[24px] border-t border-border/30 bg-card px-5 pt-3 pb-4"
        style={{
          boxShadow:
            "0 -4px 16px oklch(0.196 0.017 48.56 / 0.06), 0 -1px 4px oklch(0.196 0.017 48.56 / 0.04)",
        }}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-border opacity-60" />

        {/* Title — fixed height, 2 lines */}
        <div className="mb-2 min-h-[3rem]">
          <TextEffect
            key={`title-${stepId}`}
            per="word"
            preset="slide"
            trigger={showText}
            className="font-display text-[22px] font-[600] leading-snug text-foreground"
          >
            {title}
          </TextEffect>
        </div>

        {/* Body — fixed height, 3 lines */}
        <m.p
          key={`body-${stepId}`}
          className="min-h-[4.5rem] text-[17px] leading-[1.45] text-muted-foreground"
          animate={{ opacity: showText ? 1 : 0, y: showText ? 0 : 4 }}
          transition={{ duration: dur.text, ease: ease.out, delay: 0.12 }}
        >
          {body}
        </m.p>

        {/* Learn more (expanded only) */}
        {isExpanded && more && (
          <m.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur.text, ease: ease.out }}
            className="mt-2 text-[15px] leading-[1.45] text-muted-foreground"
          >
            {more}
          </m.p>
        )}

        {/* Learn more toggle */}
        {more && !isExpanded && (
          <button
            className="mt-1 text-[14px] font-medium text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => {
              setIsExpanded(true);
              y.set(LEARN_MORE_Y);
            }}
          >
            {copy.lesson.learnMore}
          </button>
        )}
      </div>
    </m.div>
  );
}
