import { v } from "convex/values";
import { validateThreadBelongsToUser, findThread, getAndValidateThread, mikebot } from "./lib";
import { paginationOptsValidator } from "convex/server";
import { vStreamArgs, listUIMessages, syncStreams } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { convex } from "../builder";

export const findThreadForUser = convex
  .query()
  .input({
    threadId: v.string(),
    userId: v.id("users"),
  })
  .handler(async (ctx, args) => {
    // Make sure we can grab the thread
    const thread = await findThread(ctx, { threadId: args.threadId });
    if (!thread) return null;

    // Make sure the thread belongs to the user (otherwise throw)
    validateThreadBelongsToUser({ thread, userId: args.userId });

    return thread;
  })
  .public();

export const listMessagesForUserThread = convex
  .query()
  .input({
    userId: v.id("users"),
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  })
  .handler(async (ctx, args) => {
    // Make sure the user can view this thread
    await getAndValidateThread(ctx, { threadId: args.threadId, userId: args.userId });

    // Grab the messages from the thread based on the current page
    const paginated = await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    // I also want to get the messages that are streaming
    const streams = await syncStreams(ctx, components.agent, {
      threadId: args.threadId,
      streamArgs: args.streamArgs,
    });

    return { ...paginated, streams };
  })
  .public();
