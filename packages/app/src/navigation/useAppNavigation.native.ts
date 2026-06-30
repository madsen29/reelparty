"use client";

import { useRouter } from "expo-router";

/**
 * Native navigation via Expo Router. Solito's useRouter reads
 * @react-navigation/native's LinkingContext, but Expo Router provides its own
 * forked context — so we call expo-router directly on native.
 */
export function useAppNavigation() {
  const router = useRouter();
  return {
    goHome: () => router.replace("/"),
    goCreate: () => router.push("/create"),
    goJoin: () => router.push("/join"),
    goJoinName: (code: string) => router.push(`/join/${code}`),
    goParty: (code: string) => router.replace(`/party/${code}`),
    back: () => router.back(),
  };
}
