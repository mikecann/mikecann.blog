import { components } from "../_generated/api";
import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { Id } from "../_generated/dataModel";
import { DatabaseReader } from "../_generated/server";

export const createMikebotAgent = () => {
  const mikebotAgent = new Agent(components.agent, {
    name: "Mikebot",
    chat: openai.chat("gpt-4o-mini"),
    textEmbedding: openai.embedding("text-embedding-3-small"),
    instructions: "You are a helpful assistant.",
    tools: {},
  });
  return mikebotAgent;
};

export const validateUserExists = async (db: DatabaseReader, args: { userId: Id<"users"> }) => {
  const user = await db.get(args.userId);
  if (!user) throw new Error(`User not found with id ${args.userId}`);
  return user;
};
