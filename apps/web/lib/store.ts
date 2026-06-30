import type { KeyValueStore } from "@reelparty/shared";

/** Web KeyValueStore backed by localStorage (SSR-safe no-ops). */
export const webStore: KeyValueStore = {
  getItem: (key) =>
    typeof window === "undefined" ? null : window.localStorage.getItem(key),
  setItem: (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  },
};
