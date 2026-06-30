/**
 * Deterministic avatar selection (face + background color) from a seed.
 * The actual face SVG geometry lives in @reelparty/ui so it can be rendered
 * with react-native-svg on every platform; the math stays here so it is
 * identical everywhere.
 */

export const AVATAR_FACE_COUNT = 30;

export const AVATAR_BG_COLORS = [
  "#C9B8FF", "#FFE066", "#8FE388", "#FF9EC7", "#6DC4FF",
  "#FFA270", "#5AD4E8", "#B8E986", "#FFB8A0", "#D4A8FF",
  "#FFF59D", "#80E5D4", "#FF8A8A", "#90CAF9", "#FFCC80",
  "#A5E6B8", "#F48FB1", "#9FA8DA", "#FFD180", "#4DB6AC",
  "#E6EE9C", "#CE93D8", "#FF8A65", "#26C6DA", "#FFB300",
  "#7E57C2", "#66BB6A", "#42A5F5", "#EC407A", "#AB47BC",
  "#AED581", "#FF7043", "#5C6BC0", "#26A69A", "#FFCA28",
  "#BA68C8", "#29B6F6", "#EF5350", "#9CCC65", "#FFA726",
] as const;

function hashSeed(seed: string, salt = 0): number {
  let h = salt;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function avatarIndexFor(seed: string | undefined): number {
  if (!seed) return 0;
  return hashSeed(seed) % AVATAR_FACE_COUNT;
}

export function avatarColorFor(seed: string | undefined): string {
  if (!seed) return AVATAR_BG_COLORS[0];
  return AVATAR_BG_COLORS[hashSeed(seed, 7) % AVATAR_BG_COLORS.length]!;
}
