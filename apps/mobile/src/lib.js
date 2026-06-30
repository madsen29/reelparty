import { avatarColorFor } from "./avatars";
import { REACTIONS, platLabel } from "./theme";

export const rid = () => Math.random().toString(36).slice(2, 10);
export const code5 = () => String(Math.floor(10000 + Math.random() * 90000));

export const ytThumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

export const defaultTitle = (p) =>
  p === "tiktok"
    ? "TikTok video"
    : p === "instagram"
      ? "Instagram Reel"
      : "YouTube Short";

export function extractLinkFromText(text) {
  if (!text) return "";
  const match = text.match(/https?:\/\/[^\s<>"']+/);
  return match ? match[0].replace(/[.,)]+$/, "") : text.trim();
}

export function normalizeClipboardText(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) return "";
  return extractLinkFromText(trimmed) || trimmed;
}

export function detectPlatform(raw) {
  if (!raw) return null;
  const url = raw.trim();
  const yt = url.match(
    /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/,
  );
  if (yt) return { platform: "youtube", videoId: yt[1], url };
  const tt = url.match(/\/video\/(\d+)/);
  if (/tiktok\.com/.test(url))
    return { platform: "tiktok", videoId: tt?.[1] || null, url };
  const ig = url.match(/instagram\.com\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)/);
  if (ig) return { platform: "instagram", videoId: ig[1], url };
  return null;
}

// Pull a 5-digit join code out of an incoming deep link / universal link.
export function parseJoinCodeFromUrl(url) {
  if (!url) return null;
  try {
    const queryMatch = url.match(/[?&]join=(\d{5})\b/);
    if (queryMatch) return queryMatch[1];
    const pathMatch = url.match(/\/join\/(\d{5})\/?(?:[?#]|$)/);
    if (pathMatch) return pathMatch[1];
  } catch {}
  return null;
}

export function isPresetReaction(reaction) {
  return REACTIONS.includes(reaction);
}

export function reactionSummary(reactions) {
  const counts = {};
  Object.values(reactions || {}).forEach((emoji) => {
    counts[emoji] = (counts[emoji] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export function reactionCount(reactions) {
  return Object.keys(reactions || {}).length;
}

export function sortQueue(items, sortBy, dir = "asc") {
  if (!items?.length) return items;
  if (sortBy === "added") {
    return dir === "desc" ? [...items].reverse() : items;
  }
  const indexed = items.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case "platform":
        cmp = (platLabel[a.v.platform] || a.v.platform).localeCompare(
          platLabel[b.v.platform] || b.v.platform,
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

// Friendly relative date for when a video was added to the queue.
export function formatAddedDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfToday - startOfDate) / 86400000);
  const time = d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  if (diffDays === 0) return time;
  if (diffDays === 1) return `Yesterday, ${time}`;
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function resolveMember(party, memberId, video) {
  const member = party?.members.find((m) => m.id === memberId);
  if (member) return { ...member, booted: false };
  const name =
    (video?.addedById === memberId ? video.addedByName : null) ||
    party?.queue.find((q) => q.addedById === memberId)?.addedByName ||
    "Guest";
  return { id: memberId, name, color: avatarColorFor(memberId), booted: true };
}

export function queueAdders(party, userId) {
  if (!party?.queue?.length) return [];
  const seen = new Set();
  const adders = [];
  for (const v of party.queue) {
    if (seen.has(v.addedById)) continue;
    seen.add(v.addedById);
    adders.push(resolveMember(party, v.addedById, v));
  }
  return adders.sort((a, b) => {
    if (a.id === userId) return -1;
    if (b.id === userId) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function sortMembersForDisplay(members, userId, hostId) {
  const byJoinOrder = (a, b) =>
    (a.joinedAt || "").localeCompare(b.joinedAt || "");
  const meMember = members.find((m) => m.id === userId);
  const hostMember = members.find((m) => m.id === hostId);
  const rest = members
    .filter((m) => m.id !== userId && m.id !== hostId)
    .sort(byJoinOrder);
  return [
    ...(meMember ? [meMember] : []),
    ...(hostMember && hostMember.id !== userId ? [hostMember] : []),
    ...rest,
  ];
}

export function memberLabel({ name, booted }) {
  return booted ? `${name} (booted)` : name;
}

export function hasActivity(video) {
  return (
    (video.watchCount || 0) > 0 ||
    Object.keys(video.reactions || {}).length > 0
  );
}
