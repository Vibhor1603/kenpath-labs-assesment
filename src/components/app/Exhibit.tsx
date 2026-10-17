import { FridgeExhibit } from "@/art/fridge/FridgeExhibit";
import { HeartExhibit } from "@/art/heart/HeartExhibit";
import { LeafExhibit } from "@/art/leaf/LeafExhibit";
import type { DiscoveryId, ExhibitArtProps } from "@/content/types";
import type { ComponentType } from "react";

const EXHIBITS: Record<DiscoveryId, ComponentType<ExhibitArtProps>> = {
  fridge: FridgeExhibit,
  leaf: LeafExhibit,
  heart: HeartExhibit,
};

/** The small exterior art used on Home, in the collection and in the reward. */
export function Exhibit({ id, ...props }: ExhibitArtProps & { id: DiscoveryId }) {
  const Art = EXHIBITS[id];
  return <Art {...props} />;
}
