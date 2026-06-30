import { initTRPC } from "@trpc/server";

/**
 * Per-request context. The party "auth" model is a stable per-device user id
 * sent by the client in each mutation input, so context stays minimal for now.
 */
export interface Context {
  userId?: string;
}

export async function createContext(): Promise<Context> {
  return {};
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
