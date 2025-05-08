import { components } from "../_generated/api";
import { tool } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Agent, createTool } from "@convex-dev/agent";
import { Id } from "../_generated/dataModel";
import { DatabaseReader } from "../_generated/server";
import { ConvexError } from "convex/values";

export const createMikebotAgent = () => {
  const mikebotAgent = new Agent(components.agent, {
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
