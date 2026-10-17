"use client";

/**
 * TextEffect wrapper using `m` from motion/react for LazyMotion strict
 * compatibility. Re-exports from motion-primitives but replaces `motion`
 * with `m` so it works inside <LazyMotion strict>.
 *
 * Usage: fade in a step title word by word with a 30 ms stagger.
 * <TextEffect per="word" preset="fade">{step.title}</TextEffect>
 */

import { cn } from "@/lib/utils";
import { AnimatePresence, m, type Variants } from "motion/react";
import React from "react";

export type TextEffectPreset = "fade" | "slide";

type PerType = "word" | "char" | "line";

type TextEffectProps = {
  children: string;
  per?: PerType;
  as?: keyof React.JSX.IntrinsicElements;
  preset?: TextEffectPreset;
  /** Additional stagger delay in seconds. */
  delay?: number;
  /** Multiplier for stagger speed (> 1 = faster). */
  speedReveal?: number;
  className?: string;
  trigger?: boolean;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

const slideItem: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

const fadeItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

function splitText(text: string, per: PerType): string[] {
  if (per === "line") return text.split("\n");
  return text.split(/(\s+)/);
}

export function TextEffect({
  children,
  per = "word",
  as = "p",
  preset = "fade",
  delay = 0,
  speedReveal = 1,
  className,
  trigger = true,
  onAnimationComplete,
  style,
}: TextEffectProps) {
  const segments = splitText(children, per);
  const stagger = (per === "char" ? 0.03 : per === "word" ? 0.03 : 0.08) / speedReveal;
  const itemVariants = preset === "slide" ? slideItem : fadeItem;

  // m[as] requires a cast because keyof JSX.IntrinsicElements is wide
  const MotionTag = m[as as "div"] as typeof m.div;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
    exit: {
      transition: { staggerChildren: stagger, staggerDirection: -1 },
    },
  };

  return (
    <AnimatePresence mode="popLayout">
      {trigger && (
        <MotionTag
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
          className={className}
          onAnimationComplete={onAnimationComplete}
          style={style}
        >
          {per !== "line" && (
            <span className="sr-only">{children}</span>
          )}
          {segments.map((segment, index) => (
            <m.span
              key={`${per}-${index}-${segment}`}
              aria-hidden="true"
              variants={itemVariants}
              transition={{ duration: 0.25 }}
              className={cn(
                per === "line" ? "block" : "inline-block whitespace-pre",
              )}
            >
              {segment}
            </m.span>
          ))}
        </MotionTag>
      )}
    </AnimatePresence>
  );
}
