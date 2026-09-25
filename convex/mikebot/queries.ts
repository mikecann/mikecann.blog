import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import {
  vStreamArgs,
  listUIMessages,
  syncStreams,
  type SyncStreamsReturnValue,
  type UIMessage,
} from "@convex-dev/agent";
import { components } from "../_generated/api";
import { convex } from "../builder";
import { MIKEBOT_LIMITS } from "./config";
import { findOwnedThread, findUserByToken } from "./guards";

export const findThreadForUser = convex
  .query()
  .input({
    token: v.string(),
    threadId: v.string(),
  })
  .returns(v.union(v.null(), v.object({ _id: v.string(), _creationTime: v.number() })))
  .handler(async (ctx, args) => {
    const user = await findUserByToken(ctx, args.token);
    if (!user) return null;

    // Returns null (rather than throwing) for threads that don't exist or that
    // belong to someone else, so the client can simply start a new thread.
    const thread = await findOwnedThread(ctx, { threadId: args.threadId, userId: user._id });
    if (!thread) return null;

    return { _id: thread._id, _creationTime: thread._creationTime };
  })
  .public();

export const listMessagesForUserThread = convex
  .query()
  .input({
    token: v.string(),
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  })
  .handler(async (ctx, args) => {
    const user = await findUserByToken(ctx, args.token);
    const thread = user
      ? await findOwnedThread(ctx, { threadId: args.threadId, userId: user._id })
      : null;

    // Not theirs (or deleted): return an empty page instead of throwing, so a
    // stale thread id can never crash the widget.
    if (!thread) {
      const streams: SyncStreamsReturnValue =
        args.streamArgs?.kind === "list"
          ? { kind: "list", messages: [] }
          : args.streamArgs?.kind === "deltas"
            ? { kind: "deltas", deltas: [] }
            : undefined;
      return { page: [] as UIMessage[], isDone: true, continueCursor: "", streams };
    }

    // Grab the messages from the thread based on the current page
    const paginated = await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: {
        ...args.paginationOpts,
        numItems: Math.min(args.paginationOpts.numItems, MIKEBOT_LIMITS.maxMessagesPerPage),
      },
    });

    // I also want to get the messages that are streaming
    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    });

    return { ...paginated, streams };
  })
  .public();
