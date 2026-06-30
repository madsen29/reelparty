import Constants from "expo-constants";

/**
 * Resolve the tRPC API base URL.
 *  1. EXPO_PUBLIC_API_URL (set this for staging/production builds), else
 *  2. the Metro dev-server host on port 3000 (the local Next.js app), else
 *  3. localhost (simulator only).
 */
function devHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig?.debuggerHost as string | undefined);
  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:3000` : null;
}

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL || devHost() || "http://localhost:3000";
