"use client";

import type { Discovery } from "@/content/types";
import { artLoaders } from "@/content/index";
import { spring } from "@/lib/motion";
import { ambient } from "@/lib/tokens";
import { m } from "motion/react";
import type { ComponentType } from "react";
import type { ArtComponentProps } from "@/content/types";
import { useEffect, useRef, useState } from "react";

type HomeObjectProps = {
  discovery: Discovery;
  onPress: () => void;
};

type ArtType = ComponentType<ArtComponentProps>;

/**
 * HomeObject: wraps today's discovery art on the Home screen.
 * - Press lift: y: -8, scale: 1.02 with spring.lift, contact shadow shrinks.
 * - Idle settle: every 7-11s, a gentle rotate 0.6deg and back.
 * - Fridge easter egg: hold for 400ms to "open" the door.
 */
export function HomeObject({ discovery, onPress }: HomeObjectProps) {
  const [ArtComponent, setArtComponent] = useState<ArtType | null>(null);
  const [isLifted, setIsLifted] = useState(false);
  const [settleAngle, setSettleAngle] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);

  // Load art chunk
  useEffect(() => {
    const loader = artLoaders[discovery.id];
    loader().then((mod) => setArtComponent(() => mod.default as ArtType));
  }, [discovery.id]);

  useEffect(() => {
    let cancelled = false;

    const scheduleSettle = () => {
      if (cancelled) return;
      const delay =
        ambient.settleMinMs +
        Math.random() * (ambient.settleMaxMs - ambient.settleMinMs);
      settleTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        setSettleAngle(0.6);
        setTimeout(() => {
          if (cancelled) return;
          setSettleAngle(0);
          scheduleSettle();
        }, 1200);
      }, delay);
    };

    scheduleSettle();
    return () => {
      cancelled = true;
      if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
    };
  }, []);

  const handlePressStart = () => {
    setIsLifted(true);
    isHoldingRef.current = true;
    // Easter egg: hold 400ms for door-open effect
    holdTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        // Trigger door easter egg (for fridge only)
      }
    }, ambient.holdDoorMs);
  };

  const handlePressEnd = () => {
    setIsLifted(false);
    isHoldingRef.current = false;
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Contact shadow */}
      <m.div
        className="absolute bottom-0 left-1/2 h-4 rounded-full"
        style={{
          width: 120,
          marginLeft: -60,
          background:
            "radial-gradient(ellipse at center, rgba(43,36,32,0.28) 0%, transparent 70%)",
        }}
        animate={{
          scaleX: isLifted ? 0.88 : 1,
          opacity: isLifted ? 0.6 : 1,
        }}
        transition={spring.lift}
      />

      {/* Art wrapper */}
      <m.button
        className="flex items-center justify-center cursor-pointer"
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
        animate={{
          y: isLifted ? -8 : settleAngle !== 0 ? 0 : 0,
          scale: isLifted ? 1.02 : 1,
          rotate: settleAngle,
        }}
        transition={isLifted ? spring.lift : { duration: 1.2, ease: "easeInOut" }}
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerLeave={handlePressEnd}
        onClick={onPress}
        aria-label={`Start: ${discovery.title}`}
      >
        <div style={{ width: 180, height: 280 }}>
          {ArtComponent ? (
            <ArtComponent
              idPrefix={`home-${discovery.id}`}
              variant="full"
            />
          ) : (
            <div className="h-full w-full rounded-[16px] bg-card animate-pulse" />
          )}
        </div>
      </m.button>
    </div>
  );
}
