import AsyncStorage from "@react-native-async-storage/async-storage";
import { rid } from "./lib";

const UID_KEY = "rp_uid";
const SESSION_KEY = "rp_session";
const QUEUE_FILTERS_KEY = "rp_queue_filters";

// Stable per-device user id (created once, then reused).
export async function getUserId() {
  let id = await AsyncStorage.getItem(UID_KEY);
  if (!id) {
    id = rid();
    await AsyncStorage.setItem(UID_KEY, id);
  }
  return id;
}

export async function loadSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    const s = JSON.parse(raw || "null");
    return s?.code ? s : null;
  } catch {
    return null;
  }
}

export async function saveSession(code, watchingVideoId) {
  if (!code) {
    await AsyncStorage.removeItem(SESSION_KEY);
    return;
  }
  const prev = await loadSession();
  const payload = { code };
  const nextWatching =
    watchingVideoId !== undefined
      ? watchingVideoId
      : prev?.code === code
        ? prev?.watchingVideoId
        : undefined;
  if (nextWatching) payload.watchingVideoId = nextWatching;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(payload));
}

export async function loadQueueFilters(code) {
  if (!code) return { hideWatched: false, filterUserId: null };
  try {
    const all = JSON.parse(
      (await AsyncStorage.getItem(QUEUE_FILTERS_KEY)) || "{}",
    );
    const saved = all[code];
    if (saved) {
      return {
        hideWatched: !!saved.hideWatched,
        filterUserId: saved.filterUserId || null,
      };
    }
    const legacy = await AsyncStorage.getItem("rp_hide_watched");
    return { hideWatched: legacy === "1", filterUserId: null };
  } catch {
    return { hideWatched: false, filterUserId: null };
  }
}

export async function saveQueueFilters(code, filters) {
  if (!code) return;
  try {
    const all = JSON.parse(
      (await AsyncStorage.getItem(QUEUE_FILTERS_KEY)) || "{}",
    );
    all[code] = {
      hideWatched: !!filters.hideWatched,
      filterUserId: filters.filterUserId || null,
    };
    await AsyncStorage.setItem(QUEUE_FILTERS_KEY, JSON.stringify(all));
    await AsyncStorage.setItem(
      "rp_hide_watched",
      filters.hideWatched ? "1" : "0",
    );
  } catch {}
}
