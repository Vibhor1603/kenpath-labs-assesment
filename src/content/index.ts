import { fridge } from "@/content/fridge";
import { heart } from "@/content/heart";
import { leaf } from "@/content/leaf";
import type { Discovery, DiscoveryId, LessonArtModule } from "@/content/types";

export { fridge, leaf, heart };
export type { Discovery, DiscoveryId } from "@/content/types";
export { copy } from "@/content/copy";
export { sources } from "@/content/sources";
export type { Source } from "@/content/sources";

export const discoveries: Discovery[] = [fridge, leaf, heart];

export function getDiscovery(id: DiscoveryId): Discovery | undefined {
  return discoveries.find((d) => d.id === id);
}

/** Lesson art is code-split per discovery and preloaded from Home when idle. */
export const artLoaders: Record<DiscoveryId, () => Promise<LessonArtModule>> = {
  fridge: () => import("@/art/fridge/FridgeLesson"),
  leaf: () => import("@/art/leaf/LeafLesson"),
  heart: () => import("@/art/heart/HeartLesson"),
};

export const sourceIds: Record<DiscoveryId, string[]> = {
  fridge: ["refrigerator"],
  leaf: ["photosynthesis-ng", "photosynthesis-khan"],
  heart: ["heart-blood-flow", "heart-anatomy"],
};
