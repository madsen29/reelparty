import {
  addVideoInput,
  createPartyInput,
  joinPartyInput,
  metaInput,
  metaResult,
  partyCodeSchema,
  playVideoInput,
  reactInput,
  removeMemberInput,
  videoActionInput,
} from "@reelparty/shared";
import { z } from "zod";
import * as repo from "./repo";
import { fetchMeta } from "./meta";
import { createCallerFactory, publicProcedure, router } from "./trpc";

const codeInput = z.object({ code: partyCodeSchema });

export const appRouter = router({
  party: router({
    get: publicProcedure
      .input(codeInput)
      .query(({ input }) => repo.getParty(input.code)),
    members: publicProcedure
      .input(codeInput)
      .query(({ input }) => repo.getMembers(input.code)),
    queue: publicProcedure
      .input(codeInput)
      .query(({ input }) => repo.getQueue(input.code)),
    /** Hydrated party view (party + members + queue). */
    full: publicProcedure
      .input(codeInput)
      .query(({ input }) => repo.getPartyView(input.code)),
    memberCount: publicProcedure
      .input(codeInput)
      .query(async ({ input }) => ({
        count: await repo.getMemberCount(input.code),
      })),
    create: publicProcedure
      .input(createPartyInput)
      .mutation(async ({ input }) => {
        await repo.createParty(input);
        return { ok: true };
      }),
    join: publicProcedure.input(joinPartyInput).mutation(async ({ input }) => {
      await repo.joinParty(input);
      return { ok: true };
    }),
    removeMember: publicProcedure
      .input(removeMemberInput)
      .mutation(async ({ input }) => {
        await repo.removeMember(input);
        return { ok: true };
      }),
    play: publicProcedure.input(playVideoInput).mutation(async ({ input }) => {
      await repo.playVideo(input);
      return { ok: true };
    }),
  }),

  queue: router({
    add: publicProcedure.input(addVideoInput).mutation(async ({ input }) => {
      await repo.addVideo(input);
      return { ok: true };
    }),
    remove: publicProcedure
      .input(videoActionInput)
      .mutation(async ({ input }) => {
        await repo.removeVideo(input);
        return { ok: true };
      }),
    unwatch: publicProcedure
      .input(videoActionInput)
      .mutation(async ({ input }) => {
        await repo.unwatchVideo(input);
        return { ok: true };
      }),
    react: publicProcedure.input(reactInput).mutation(async ({ input }) => {
      await repo.reactToVideo(input);
      return { ok: true };
    }),
  }),

  meta: router({
    fetch: publicProcedure
      .input(metaInput)
      .output(metaResult)
      .query(({ input }) => fetchMeta(input.url)),
  }),
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
