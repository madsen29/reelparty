import { PLATFORM_LABEL } from "./constants";
import { reactionCount } from "./reactions";
import type { QueueItem, QueueSortId, SortDir } from "./types";

export function hasActivity(video: QueueItem): boolean {
  return (
    (video.watchCount || 0) > 0 ||
    Object.keys(video.reactions || {}).length > 0
  );
}

/** Sort a queue by the chosen criterion, stable within ties. */
export function sortQueue(
  items: QueueItem[],
  sortBy: QueueSortId,
  dir: SortDir = "asc",
): QueueItem[] {
  if (!items?.length) return items;
  if (sortBy === "added") {
    return dir === "desc" ? [...items].reverse() : items;
  }
  const indexed = items.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "platform":
        cmp = (PLATFORM_LABEL[a.v.platform] || a.v.platform).localeCompare(
          PLATFORM_LABEL[b.v.platform] || b.v.platform,
        );
        break;
      case "reaction":
        cmp = reactionCount(a.v.reactions) - reactionCount(b.v.reactions);
        break;
      case "views":
        cmp = (a.v.watchCount || 0) - (b.v.watchCount || 0);
        break;
    }
    return cmp || a.i - b.i;
  });
  if (dir === "desc") indexed.reverse();
  return indexed.map(({ v }) => v);
}
