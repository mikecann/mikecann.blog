import { components, internal } from "../_generated/api";
import { openai } from "@ai-sdk/openai";
import { Agent, createTool, ThreadDoc, ToolCtx } from "@convex-dev/agent";
import { Id } from "../_generated/dataModel";
import { DatabaseReader, QueryCtx } from "../_generated/server";
import { z } from "zod";

export const mikebotTools = {
  searchBlogPosts: createTool({
    description: "Search the blog posts for the given query",
    args: z.object({
      query: z.string(),
    }),
    handler: async (ctx, args) => {
      const blogPosts: any = await ctx.runQuery(
        internal.blogPosts.internal.queries.textSearchBlogPosts,
        {
          query: args.query,
        },
      );
      return blogPosts;
    },
  }),
};



export const createMikebotAgent = () => {
  const mikebotAgent = new Agent(components.agent, {
    name: "Mikebot",
    chat: openai.chat("gpt-4o-mini"),
    textEmbedding: openai.embedding("text-embedding-3-small"),
    instructions: `You are Mikebot a helpful assistant embedded on the blog of Michael Cann.
    
Your role is to help the user with their questions about Michael Cann a software developer with 17 years of experience. You write about AI, coding, and your projects on your blog. 

You have access to multiple tools that will let you retrieve every blog post written by Michael which contains all the information you need. 

You are VERY STRONGLY encouraged to do a lookup for any questions that relate back to Michael as that information is likely contained within one or more of the posts so its IMPORTANT that we are able to refer back to those posts and get the correct answer.

Respond in a casual, humorous yet knowledgeable tone. Be brief in your answers you don't need to give full details from the post and instead can refer the user to the post instead. 

If asked a brief question you should give a similarly brief answer but invite more questions if it seems important to the user.

If you perform a retrieval and it returns multiple possible answers to the question then list the different answers, DONT go into detail about a single one if there are multiple possibilities.

If asked, the best way to contact mike is via email: mike.cann@gmail.com.`,
    tools: mikebotTools,
    maxSteps: 10,
  });
  return mikebotAgent;
};

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

export const findThread = async (ctx: QueryCtx, args: { threadId: string }) => {
  const thread = await ctx.runQuery(components.agent.messages.getThread, {
    threadId: args.threadId,
  });
  return thread;
};

export const getThread = async (ctx: QueryCtx, args: { threadId: string }) => {
  const thread = await findThread(ctx, { threadId: args.threadId });
  if (!thread) throw new Error(`Thread not found with id ${args.threadId}`);
  return thread;
};
