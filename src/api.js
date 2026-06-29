import { avatarColorFor } from "./avatars.jsx";

const mapParty = (r) => r && ({
  code: r.code, hostId: r.host_id, hostName: r.host_name, nowPlayingId: r.now_playing_id,
});
const mapMember = (r) => ({ id: r.id, name: r.name, color: r.color, joinedAt: r.joined_at || "" });
const mapVideo = (r) => ({
  id: r.id, url: r.url, platform: r.platform, videoId: r.video_id,
  title: r.title, creator: r.creator, thumbnail: r.thumbnail,
  addedById: r.added_by_id, addedByName: r.added_by_name,
  createdAt: r.created_at || "",
  watchedBy: Array.isArray(r.watched_by) ? r.watched_by : [],
  watchCount: Array.isArray(r.watched_by) ? r.watched_by.length : (r.watched ? 1 : 0),
  reactions: r.reactions && typeof r.reactions === "object" ? r.reactions : {},
});

async function req(path, opts) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) throw new Error(await res.text() || res.statusText);
  if (res.status === 204) return null;
  return res.json();
}

export async function getParty(code) {
  const data = await req(`/api/parties/${encodeURIComponent(code)}`);
  return mapParty(data);
}
export async function getMembers(code) {
  const data = await req(`/api/parties/${encodeURIComponent(code)}/members`);
  return (data || []).map(mapMember);
}
export async function getQueue(code) {
  const data = await req(`/api/parties/${encodeURIComponent(code)}/queue`);
  return (data || []).map(mapVideo);
}
export async function createParty(code, hostId, hostName) {
  await req("/api/parties", {
    method: "POST",
    body: JSON.stringify({ code, hostId, hostName, color: avatarColorFor(hostId) }),
  });
}
export async function joinParty(code, id, name) {
  const color = avatarColorFor(id);
  await req(`/api/parties/${encodeURIComponent(code)}/members`, {
    method: "POST",
    body: JSON.stringify({ id, name, color }),
  });
}
export async function addVideo(v) {
  await req("/api/queue", {
    method: "POST",
    body: JSON.stringify({
      id: v.id, partyCode: v.partyCode, url: v.url, platform: v.platform, videoId: v.videoId,
      title: v.title, creator: v.creator, thumbnail: v.thumbnail,
      addedById: v.addedById, addedByName: v.addedByName, position: v.position,
    }),
  });
}
export async function playVideo(code, videoId, userId) {
  await req(`/api/parties/${encodeURIComponent(code)}/play`, {
    method: "POST",
    body: JSON.stringify({ videoId, userId }),
  });
}
export async function unwatchVideo(partyCode, videoId, userId) {
  await req(`/api/queue/${encodeURIComponent(videoId)}/unwatch`, {
    method: "POST",
    body: JSON.stringify({ partyCode, userId }),
  });
}
export async function reactToVideo(partyCode, videoId, userId, reaction) {
  await req(`/api/queue/${encodeURIComponent(videoId)}/react`, {
    method: "POST",
    body: JSON.stringify({ partyCode, userId, reaction }),
  });
}
export async function removeMember(code, memberId, hostId) {
  await req(`/api/parties/${encodeURIComponent(code)}/members/${encodeURIComponent(memberId)}/remove`, {
    method: "POST",
    body: JSON.stringify({ hostId }),
  });
}
export async function removeVideo(partyCode, videoId, userId) {
  await req(`/api/queue/${encodeURIComponent(videoId)}/remove`, {
    method: "POST",
    body: JSON.stringify({ partyCode, userId }),
  });
}
