import { components, internal } from "../_generated/api";
import { Agent, createTool } from "@convex-dev/agent";
import { z } from "zod";
import { aboutMikeMarkdown } from "./constants";
import { searchBlogPosts, type BlogPostMatch } from "../blogPosts/lib";
import { MIKEBOT_LANGUAGE_MODEL, MIKEBOT_LIMITS } from "./config";

export const mikebotTools = {
  searchBlogPosts: createTool({
    description: "Search the blog posts for the given query",
    inputSchema: z.object({
      query: z.string(),
    }),
    execute: async (ctx, args): Promise<BlogPostMatch[]> => searchBlogPosts(ctx, args.query),
  }),
  getMikeAboutPage: createTool({
    description:
      "Retrieves some extra personal information about Mike and his history from his About page",
    inputSchema: z.object({}),
    execute: async (): Promise<string> => aboutMikeMarkdown,
  }),
};

export const mikebot = new Agent(components.agent, {
  name: "Mikebot",
  languageModel: MIKEBOT_LANGUAGE_MODEL,
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
  maxSteps: MIKEBOT_LIMITS.maxSteps,
  // Only the most recent messages of the thread are sent as context. No
  // embedding model is configured, so there is no vector search over messages.
  contextOptions: { recentMessages: MIKEBOT_LIMITS.recentMessages },
  // Record token usage and cost for the daily budgets (called once per LLM step).
  usageHandler: async (ctx, { usage, providerMetadata }) => {
    const inputTokens = usage.inputTokens ?? 0;
    const outputTokens = usage.outputTokens ?? 0;
    const cost = providerMetadata?.convexGateway?.cost;
    if (!usage.totalTokens && !usage.inputTokens && cost === undefined)
      console.warn(
        "Mikebot: the model reported no usage for this step; the daily budgets can't count it",
      );
    try {
      await ctx.runMutation(internal.mikebot.internal.mutations.recordTokenUsage, {
        inputTokens,
        outputTokens,
        totalTokens: usage.totalTokens ?? inputTokens + outputTokens,
        costUsd: typeof cost == "number" ? cost : undefined,
      });
    } catch (error) {
      // Never fail a reply because usage bookkeeping failed.
      console.error("Failed to record Mikebot token usage", error);
    }
  },
});

/**
 * The prompt saved for a visitor's message: their text plus some context about
 * where they are on the site. The client parses this back for display.
 */
export const createUserPrompt = ({
  message,
  currentUrl,
}: {
  message: string;
  currentUrl?: string;
}): string =>
  JSON.stringify(
    {
      context: {
        currentUrl: (currentUrl ?? "").slice(0, MIKEBOT_LIMITS.maxContextUrlLength),
      },
      message,
    },
    null,
    2,
  );
