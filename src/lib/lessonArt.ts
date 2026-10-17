import { artLoaders } from "@/content/index";
import type { DiscoveryId, LessonArtModule } from "@/content/types";

const cache = new Map<DiscoveryId, LessonArtModule>();
const pending = new Map<DiscoveryId, Promise<LessonArtModule>>();

export function getLoadedLessonArt(id: DiscoveryId): LessonArtModule | null {
  return cache.get(id) ?? null;
}

/** Loads a lesson's art chunk once. Home calls this when idle, so the first tap is instant. */
export function loadLessonArt(id: DiscoveryId): Promise<LessonArtModule> {
  const hit = cache.get(id);
  if (hit) return Promise.resolve(hit);
  let p = pending.get(id);
  if (!p) {
    p = artLoaders[id]().then((m) => {
      cache.set(id, m);
      pending.delete(id);
      return m;
    });
    pending.set(id, p);
  }
  return p;
}
