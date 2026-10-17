"use client";

import { m } from "motion/react";

/**
 * SketchLoader: shown while lesson art is loading.
 * Animates a pencil-sketch outline of a generic object (fridge silhouette)
 * drawing itself via stroke-dashoffset, 600ms loop.
 * Never a blank screen.
 */
export function SketchLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <m.svg
        width="120"
        height="200"
        viewBox="0 0 120 200"
        aria-label="Loading"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Sketch outline: simplified fridge silhouette */}
        <rect
          x="10"
          y="10"
          width="100"
          height="180"
          rx="8"
          fill="none"
          stroke="#5E554D"
          strokeWidth="1.5"
          strokeDasharray="400"
          strokeDashoffset="0"
          style={{
            animation: "sketch-draw 0.6s linear infinite alternate",
          }}
        />
        <rect x="10" y="70" width="100" height="2" rx="1"
          fill="none" stroke="#5E554D" strokeWidth="1" strokeOpacity="0.5" />
        {/* Handle */}
        <rect x="90" y="90" width="8" height="50" rx="4"
          fill="none" stroke="#5E554D" strokeWidth="1.5" strokeOpacity="0.6" />
        <style>{`
          @keyframes sketch-draw {
            from { stroke-dashoffset: 400; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>
      </m.svg>
    </div>
  );
}
