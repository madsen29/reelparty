import { REACTIONS } from "./constants";
import type { Reactions } from "./types";

export function isPresetReaction(reaction: string): boolean {
  return (REACTIONS as readonly string[]).includes(reaction);
}

/** Validate a reaction is a single emoji grapheme (used by the server). */
export function isValidReaction(reaction: unknown): reaction is string {
  if (typeof reaction !== "string" || !reaction) return false;
  if (isPresetReaction(reaction)) return true;
  try {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const segments = [...segmenter.segment(reaction)];
    if (segments.length !== 1) return false;
    return /\p{Extended_Pictographic}/u.test(segments[0]!.segment);
  } catch {
    return reaction.length <= 8 && /\p{Extended_Pictographic}/u.test(reaction);
  }
}

/** [emoji, count] pairs sorted by count desc. */
export function reactionSummary(
  reactions: Reactions | undefined,
): Array<[string, number]> {
  const counts: Record<string, number> = {};
  Object.values(reactions || {}).forEach((emoji) => {
    counts[emoji] = (counts[emoji] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export function reactionCount(reactions: Reactions | undefined): number {
  return Object.keys(reactions || {}).length;
}
