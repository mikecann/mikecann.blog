import { components, internal } from "../_generated/api";
import { openai } from "@ai-sdk/openai";
import { Agent, createTool, MessageDoc, ThreadDoc } from "@convex-dev/agent";
import { Id } from "../_generated/dataModel";
import { DatabaseReader, QueryCtx } from "../_generated/server";
import { z } from "zod";
import { aboutMikeMarkdown } from "./constants";
import { isNotNullOrUndefined } from "../../essentials/misc/filter";
import { BlogPostMatch } from "../blogPosts/internal/queries";

export const mikebotTools = {
  searchBlogPosts: createTool({
    description: "Search the blog posts for the given query",
    args: z.object({
      query: z.string(),
    }),
    handler: async (ctx, args): Promise<BlogPostMatch[]> =>
      ctx.runAction(internal.blogPosts.internal.actions.ragSearchBlogPosts, {
        query: args.query,
      }),
  }),
  getMikeAboutPage: createTool({
    description:
      "Retrieves some extra personal information about Mike and his history from his About page",
    args: z.object({}),
    handler: async (ctx, args): Promise<string> => aboutMikeMarkdown,
  }),
};

export const mikebot = new Agent(components.agent, {
  name: "Mikebot",
  chat: openai.chat("gpt-4.1-mini"),
  textEmbedding: openai.embedding("text-embedding-3-small"),
  instructions: `You are Mikebot a helpful assistant embedded on the blog of Michael Cann.
  
Your role is to help the user with their questions about Michael Cann a software developer with 17 years of experience. You write about AI, coding, and your projects on your blog. 

Each message from a user will be given to you as a JSON object that will include the message from the user AND some added context about the user.

You have access to multiple tools that will let you retrieve every blog post written by Michael which contains all the information you need. 

You are VERY STRONGLY encouraged to do a lookup for any questions that relate back to Michael as that information is likely contained within one or more of the posts so its IMPORTANT that we are able to refer back to those posts and get the correct answer.

If you do searchBlogPosts then please return each post in a list with a link to the post and how its relevant. If its not relevant you can just omit it from the list. Its important that you do not include the post if its not relevant.

You should respond in markdown format, so any links should be formatted as [link text](url).

Respond in a casual, humorous yet knowledgeable tone. Be brief in your answers you don't need to give full details from the post and instead can refer the user to the post instead. 

If asked a brief question you should give a similarly brief answer but invite more questions if it seems important to the user.

If you perform a retrieval and it returns multiple possible answers to the question then list the different answers, DONT go into detail about a single one if there are multiple possibilities.

If asked, the best way to contact mike is via email: mike.cann@gmail.com.`,
  tools: mikebotTools,
  maxSteps: 10,
});

export const validateUserExists = async (db: DatabaseReader, args: { userId: Id<"users"> }) => {
  const user = await db.get(args.userId);
  if (!user) throw new Error(`User not found with id ${args.userId}`);
  return user;
};

export const validateThreadBelongsToUser = ({
  thread,
  userId,
}: {
  thread: ThreadDoc;
  userId: Id<"users">;
}) => {
  if (thread.userId !== userId)
    throw new Error(`Thread ${thread._id} does not belong to user ${userId}`);

  return thread;
};

export const getAndValidateThread = async (
  ctx: QueryCtx,
  args: { threadId: string; userId: Id<"users"> },
) => {
  const thread = await findThread(ctx, { threadId: args.threadId });
  if (!thread) throw new Error(`Thread not found with id ${args.threadId}`);
  validateThreadBelongsToUser({ thread, userId: args.userId });
  return thread;
};

export const findThread = async (ctx: QueryCtx, args: { threadId: string }) => {
  const thread = await ctx.runQuery(components.agent.threads.getThread, {
    threadId: args.threadId,
  });
  return thread;
};

export const getThread = async (ctx: QueryCtx, args: { threadId: string }) => {
  const thread = await findThread(ctx, { threadId: args.threadId });
  if (!thread) throw new Error(`Thread not found with id ${args.threadId}`);
  return thread;
};

export const filterOutToolResults = (messages: MessageDoc[]) =>
  messages
    .map((message) => {
      if (message.message?.role == "tool" && message.message.content[0].type == "tool-result")
        return null;
      return message;
    })
    .filter(isNotNullOrUndefined);
