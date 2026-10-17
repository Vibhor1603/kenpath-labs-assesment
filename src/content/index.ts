import { fridge } from "@/content/fridge";
import { heart } from "@/content/heart";
import { leaf } from "@/content/leaf";
import type { ComponentType } from "react";
import type {
  ArtComponentProps,
  Discovery,
  DiscoveryId,
} from "@/content/types";

export { fridge, leaf, heart };
export type { Discovery, DiscoveryId } from "@/content/types";
export { copy } from "@/content/copy";
export { sources } from "@/content/sources";
export type { Source } from "@/content/sources";

export const discoveries: Discovery[] = [fridge, leaf, heart];

export function getDiscovery(id: DiscoveryId): Discovery | undefined {
  return discoveries.find((d) => d.id === id);
}

export type { ArtComponentProps } from "@/content/types";

export const artLoaders: Record<
  DiscoveryId,
  () => Promise<{ default: ComponentType<ArtComponentProps> }>
> = {
  fridge: () => import("@/art/fridge/FridgeArt"),
  leaf: () => import("@/art/leaf/LeafArt"),
  heart: () => import("@/art/heart/HeartArt"),
};
