import { Platform } from "react-native";

// Where the ReelParty API/server lives.
// Override at runtime with EXPO_PUBLIC_API_URL (e.g. http://192.168.1.20:3001).
//
// On a phone you MUST use your computer's LAN IP (not localhost), because
// "localhost" on the device points at the device itself. The Android emulator
// can reach the host machine at 10.0.2.2.
const envUrl = process.env.EXPO_PUBLIC_API_URL;

function defaultApiUrl() {
  if (Platform.OS === "android") return "http://10.0.2.2:3001";
  return "http://localhost:3001";
}

export const API_BASE_URL = (envUrl ? envUrl : defaultApiUrl()).replace(/\/$/, "");

// Public web origin used when generating invite links to share with friends.
// Friends who open this on a browser land on the ReelParty web app.
export const WEB_ORIGIN = (
  process.env.EXPO_PUBLIC_WEB_ORIGIN || "https://reelparty.app"
).replace(/\/$/, "");

// Deep link scheme handled by the native app (see app.json "scheme").
export const APP_SCHEME = "reelparty";
