import { fridge as fridgeRaw } from "@/content/fridge";
import { heart as heartRaw } from "@/content/heart";
import { leaf as leafRaw } from "@/content/leaf";
import { withHinglish } from "@/content/hinglish";
import type { Discovery, DiscoveryId, LessonArtModule } from "@/content/types";

function localize(d: Discovery): Discovery {
  return { ...d, steps: d.steps.map(withHinglish) };
}

export const fridge = localize(fridgeRaw);
export const leaf = localize(leafRaw);
export const heart = localize(heartRaw);

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
