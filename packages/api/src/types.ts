import type { z } from "zod";
import type {
  addVideoInput,
  createPartyInput,
  joinPartyInput,
  playVideoInput,
  reactInput,
  removeMemberInput,
  videoActionInput,
} from "@reelparty/shared";

export type CreatePartyInput = z.infer<typeof createPartyInput>;
export type JoinPartyInput = z.infer<typeof joinPartyInput>;
export type AddVideoInput = z.infer<typeof addVideoInput>;
export type PlayVideoInput = z.infer<typeof playVideoInput>;
export type VideoActionInput = z.infer<typeof videoActionInput>;
export type ReactInput = z.infer<typeof reactInput>;
export type RemoveMemberInput = z.infer<typeof removeMemberInput>;

export type {
  Member,
  PartyView,
  QueueItem,
} from "@reelparty/shared";
