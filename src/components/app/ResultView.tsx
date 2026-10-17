"use client";

import { BottomBar } from "@/components/app/BottomBar";
import { FlowTopBar } from "@/components/app/TopBar";
import { Button } from "@/components/ui/button";
import { copy } from "@/content/copy";
import type { Discovery } from "@/content/types";
import { cn } from "@/lib/utils";
import { Check, RotateCcw, X } from "lucide-react";
import { useEffect, useRef } from "react";

type ResultViewProps = {
  discovery: Discovery;
  results: boolean[];
  onRetry: () => void;
  onLesson: () => void;
  onClose: () => void;
};

export default function ResultView({
  discovery,
  results,
  onRetry,
  onLesson,
  onClose,
}: ResultViewProps) {
  const score = results.filter(Boolean).length;
  const total = results.length;
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col" data-domain={discovery.domain}>
      <FlowTopBar
        current={total}
        total={total}
        done={total}
        onClose={onClose}
        closeLabel={copy.test.close}
      />
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-6 text-center">
        <ol className="flex gap-2.5" aria-label={copy.result.scoreLine(score, total)}>
          {results.map((ok, i) => (
            <li
              key={i}
              className={cn(
                "anim-pop-in flex size-10 items-center justify-center rounded-full",
                ok
                  ? "bg-correct text-surface"
                  : "bg-wrong-tint text-wrong ring-wrong/30 ring-1 ring-inset",
              )}
              style={{ animationDelay: `${120 + i * 70}ms` }}
            >
              {ok ? (
                <Check
                  className="size-[18px]"
                  strokeWidth={3}
                  aria-label={`Question ${i + 1}: right`}
                />
              ) : (
                <X
                  className="size-[18px]"
                  strokeWidth={3}
                  aria-label={`Question ${i + 1}: not right`}
                />
              )}
            </li>
          ))}
        </ol>
        <p
          className="anim-rise-in tabular font-display text-hero mt-8 font-semibold"
          style={{ animationDelay: "420ms" }}
        >
          {score} of {total}
        </p>
        <p
          className="anim-rise-in text-body text-ink mt-3 max-w-[300px]"
          style={{ animationDelay: "500ms" }}
        >
          {score === total - 1 ? copy.result.almost : copy.result.needPerfect}
        </p>
        <p
          className="anim-rise-in text-small text-ink-soft mt-1.5 max-w-[300px]"
          style={{ animationDelay: "560ms" }}
        >
          {copy.result.shuffleNote}
        </p>
        <Button
          variant="quiet"
          size="md"
          className="anim-fade-in mt-6"
          style={{ animationDelay: "640ms" }}
          onClick={onLesson}
        >
          <RotateCcw aria-hidden="true" />
          {copy.result.watchLessonAgain}
        </Button>
      </main>
      <BottomBar>
        <Button ref={primaryRef} className="flex-1" onClick={onRetry}>
          {copy.result.tryAgain}
        </Button>
      </BottomBar>
    </div>
  );
}
