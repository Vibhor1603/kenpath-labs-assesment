import { Butterfly } from "@/components/scene/Butterfly";
import { Grass } from "@/components/scene/Grass";
import { Sky } from "@/components/scene/Sky";
import type { ReactNode } from "react";

type HomeSceneProps = {
  /** The object (HomeObject) rendered at the center-bottom of the scene. */
  children: ReactNode;
};

/**
 * HomeScene: the hero scene for the Home view.
 * Sky gradient, static sun bloom, three grass bands, butterfly.
 * Children (today's object) are centered horizontally and sit in the grass.
 * Height: 58svh (matches the stage height calculation).
 */
export function HomeScene({ children }: HomeSceneProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "58svh" }}
      aria-label="Museum scene"
    >
      <Sky />
      <Grass />
      <Butterfly />

      {/* Object container: centered, bottom-aligned so it sits in the grass */}
      <div
        className="absolute inset-x-0 bottom-8 flex items-end justify-center"
        style={{ paddingBottom: 16 }}
      >
        {children}
      </div>
    </div>
  );
}
