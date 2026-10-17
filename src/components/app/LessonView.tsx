"use client";

import { SketchLoader } from "@/components/app/SketchLoader";
import { Stage } from "@/components/stage/Stage";
import { StageLabels } from "@/components/stage/StageLabels";
import { LessonSheet } from "@/components/stage/LessonSheet";
import {
  useStepChoreography,
} from "@/components/stage/useStepChoreography";
import { artLoaders, getDiscovery } from "@/content/index";
import type { DiscoveryId, PartPose } from "@/content/types";
import { copy } from "@/content/copy";
import { useVisibility } from "@/hooks/useVisibility";
import { useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { ArtComponentProps } from "@/content/types";

type LessonViewProps = {
  discoveryId: DiscoveryId;
  stepIndex: number; // 1-based
  onStepChange: (step: number) => void;
  onFinish: () => void;
  liveMessage: string;
  setLiveMessage: (msg: string) => void;
};

type ArtType = ComponentType<ArtComponentProps & {
  stepPose?: Record<string, PartPose>;
  focusedParts?: string[];
}>;

/**
 * LessonView: renders the stage with art, labels, and the lesson sheet.
 * Drives step navigation and announces step changes to the live region.
 */
export function LessonView({
  discoveryId,
  stepIndex,
  onStepChange,
  onFinish,
  setLiveMessage,
}: LessonViewProps) {
  const discovery = getDiscovery(discoveryId);
  const [ArtComponent, setArtComponent] = useState<ArtType | null>(null);
  const isVisible = useVisibility();

  // Load art chunk
  useEffect(() => {
    const loader = artLoaders[discoveryId];
    loader().then((mod) => setArtComponent(() => mod.default as ArtType));
  }, [discoveryId]);

  const step = discovery?.steps[stepIndex - 1];

  // Announce step to live region
  useEffect(() => {
    if (step && discovery) {
      setLiveMessage(
        copy.aria.stepAnnounce(stepIndex, discovery.steps.length, step.title)
      );
    }
  }, [step, stepIndex, discovery, setLiveMessage]);

  const canGoNext = !!discovery && stepIndex < discovery.steps.length;
  const canGoBack = stepIndex > 1;
  const isLastStep = !!discovery && stepIndex === discovery.steps.length;

  const handleNext = () => {
    if (canGoNext) onStepChange(stepIndex + 1);
    else if (isLastStep) onFinish();
  };

  const handleBack = () => {
    if (canGoBack) onStepChange(stepIndex - 1);
  };

  if (!discovery || !step) return null;

  return (
    <LessonStepContent
      key={step.id}
      step={step}
      discoveryId={discoveryId}
      ArtComponent={ArtComponent}
      isVisible={isVisible}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
}

type LessonStepContentProps = {
  step: NonNullable<ReturnType<typeof getDiscovery>>["steps"][number];
  discoveryId: DiscoveryId;
  ArtComponent: ArtType | null;
  isVisible: boolean;
  onNext: () => void;
  onBack: () => void;
};

/** Keyed by step.id so useStepChoreography remounts at "parts" each step. */
function LessonStepContent({
  step,
  discoveryId,
  ArtComponent,
  isVisible,
  onNext,
  onBack,
}: LessonStepContentProps) {
  const { phase } = useStepChoreography(step.id);
  const showText = phase === "text" || phase === "loop";
  const stepPose = step.pose as Record<string, PartPose>;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Stage onNext={onNext} onBack={onBack}>
        <div className="flex h-full w-full items-center justify-center p-4">
          {ArtComponent ? (
            <svg
              viewBox="0 0 320 520"
              className="h-full w-auto max-w-full"
              style={{ overflow: "visible" }}
            >
              <ArtComponent
                idPrefix={discoveryId}
                variant="full"
                stepPose={stepPose}
                focusedParts={step.partFocus}
              />
              <StageLabels
                labels={step.labels}
                phase={phase}
                svgWidth={320}
                svgHeight={520}
              />
            </svg>
          ) : (
            <SketchLoader />
          )}
        </div>
      </Stage>

      <LessonSheet
        title={step.title}
        body={step.body}
        more={step.more}
        stepId={step.id}
        showText={showText}
      />

      {!isVisible && null}
    </div>
  );
}

// Bottom bar content for lesson — exported for use in page.tsx
export function getLessonPrimaryLabel(
  stepIndex: number,
  totalSteps: number,
): string {
  return stepIndex >= totalSteps ? copy.lesson.takeTheTest : copy.lesson.next;
}
