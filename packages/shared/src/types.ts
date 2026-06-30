import type { z } from "zod";
import type {
  memberSchema,
  partySchema,
  partyViewSchema,
  platformSchema,
  queueItemSchema,
  reactionsSchema,
} from "./schemas";

export type Platform = z.infer<typeof platformSchema>;
export type Reactions = z.infer<typeof reactionsSchema>;
export type Member = z.infer<typeof memberSchema>;
export type QueueItem = z.infer<typeof queueItemSchema>;
export type Party = z.infer<typeof partySchema>;
export type PartyView = z.infer<typeof partyViewSchema>;

export type QueueSortId = "added" | "platform" | "reaction" | "views";
export type SortDir = "asc" | "desc";

/** A member resolved for display, including booted (kicked) guests. */
export interface ResolvedMember extends Member {
  booted: boolean;
}

export interface DetectedLink {
  platform: Platform;
  videoId: string | null;
  url: string;
}
