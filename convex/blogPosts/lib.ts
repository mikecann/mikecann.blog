import { customAction, customMutation, customQuery } from "convex-helpers/server/customFunctions";
import { action, mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const validateBlogPostAdminToken = (token: string) => {
  if (token != process.env.BLOG_POST_ADMIN_TOKEN)
    throw new Error("Invalid token does not match env var BLOG_POST_ADMIN_TOKEN");
};

export const adminQuery = customQuery(query, {
  args: { token: v.string() },
  input: async (ctx, args) => {
    validateBlogPostAdminToken(args.token);
    return { ctx, args };
  },
});

export const adminMutation = customMutation(mutation, {
  args: { token: v.string() },
  input: async (ctx, args) => {
    validateBlogPostAdminToken(args.token);
    return { ctx, args };
  },
});

export const adminAction = customAction(action, {
  args: { token: v.string() },
  input: async (ctx, args) => {
    validateBlogPostAdminToken(args.token);
    return { ctx, args };
  },
});
