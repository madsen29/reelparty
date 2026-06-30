"use client";

import { useRouter } from "solito/navigation";

/**
 * Route map shared by web (Next App Router) and native (Expo Router):
 *   /                → Welcome
 *   /create          → Create party (host name)
 *   /join            → Enter code
 *   /join/[code]     → Enter name (also the SEO invite page on web)
 *   /party/[code]    → Party room
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
