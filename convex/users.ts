import { v } from "convex/values";
import { convex } from "./builder";

export const createAnonymousUser = convex
  .mutation()
  .handler(async (ctx) => {
    return ctx.db.insert("users", {
      kind: "anonymous",
    });
  })
  .public();

export const findUser = convex
  .query()
  .input({ id: v.id("users") })
  .handler(async (ctx, { id }) => {
    return ctx.db.get(id);
  })
  .public();
