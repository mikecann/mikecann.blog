import { convexTest } from "convex-test";
import { register } from "@convex-dev/state-machines/test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import { modules } from "../test.setup";

vi.mock("@convex-dev/ai-sdk-provider", () => ({
  convexGateway: Object.assign(() => ({}), {
    embeddingModel: () => ({ modelId: "test-embedding", provider: "test" }),
  }),
}));

const ADMIN = "me@example.com";
const originalEnv = process.env;

const setup = () => {
  const t = convexTest(schema, modules);
  register(t);
  return t;
};

const google = (email: string | undefined, emailVerified = true) => ({
  name: "google" as const,
  accountId: "google-sub",
  profile: { id: "google-sub", email, emailVerified, name: "Me" },
});

beforeEach(() => {
  process.env = {
    ...originalEnv,
    BLOG_ADMIN_EMAILS: ` other@example.com , ${ADMIN.toUpperCase()}`,
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe("signing in to the admin pages", () => {
  test("makes an account only for a verified address on BLOG_ADMIN_EMAILS", async () => {
    const t = setup();
    const id = await t.mutation(internal.admin.auth.createAdmin, { provider: google(ADMIN) });
    expect(await t.run((ctx) => ctx.db.get("admins", id))).toMatchObject({ email: ADMIN });

    await expect(
      t.mutation(internal.admin.auth.createAdmin, { provider: google("stranger@example.com") }),
    ).rejects.toThrow("isn't one of the blog's admins");
    await expect(
      t.mutation(internal.admin.auth.createAdmin, { provider: google(ADMIN, false) }),
    ).rejects.toThrow("isn't one of the blog's admins");
    await expect(
      t.mutation(internal.admin.auth.createAdmin, { provider: google(undefined) }),
    ).rejects.toThrow("isn't one of the blog's admins");
  });

  test("turns away a later sign-in once the address is off the list", async () => {
    const t = setup();
    const id = await t.mutation(internal.admin.auth.createAdmin, { provider: google(ADMIN) });
    process.env.BLOG_ADMIN_EMAILS = "other@example.com";
    await expect(
      t.mutation(internal.admin.auth.onAdminSignIn, { provider: google(ADMIN), userId: id }),
    ).rejects.toThrow("isn't one of the blog's admins");
  });

  test("judges a Google account whose address changed by its new address", async () => {
    const t = setup();
    process.env.BLOG_ADMIN_EMAILS = `${ADMIN},new@example.com`;
    const id = await t.mutation(internal.admin.auth.createAdmin, { provider: google(ADMIN) });
    await t.mutation(internal.admin.auth.onAdminSignIn, {
      provider: google("new@example.com"),
      userId: id,
    });
    const asAdmin = t.withIdentity({ subject: id });
    expect(await asAdmin.query(api.viewer.me, {})).toMatchObject({ email: "new@example.com" });

    // Only the old address left on the list: the account is out
    process.env.BLOG_ADMIN_EMAILS = ADMIN;
    expect(await asAdmin.query(api.viewer.overview, {})).toBeNull();
  });
});

describe("the Machines page's queries", () => {
  test("answer a signed-in admin, and nobody else", async () => {
    const t = setup();
    const adminId = await t.mutation(internal.admin.auth.createAdmin, { provider: google(ADMIN) });
    const asAdmin = t.withIdentity({ subject: adminId });

    expect(await t.query(api.viewer.overview, {})).toBeNull();
    expect(await t.query(api.viewer.me, {})).toBeNull();
    // A session for something that isn't an admins row
    const postId = await t.run((ctx) =>
      ctx.db.insert("users", { kind: "anonymous", tokenHash: "x" }),
    );
    expect(await t.withIdentity({ subject: postId }).query(api.viewer.overview, {})).toBeNull();

    expect(await asAdmin.query(api.viewer.me, {})).toMatchObject({ email: ADMIN });
    const overview = await asAdmin.query(api.viewer.overview, {});
    expect(JSON.stringify(overview)).toContain("postEmail");

    // Taking the address off the list locks the open session out at once
    process.env.BLOG_ADMIN_EMAILS = "other@example.com";
    expect(await asAdmin.query(api.viewer.overview, {})).toBeNull();
    expect(await asAdmin.query(api.viewer.me, {})).toBeNull();
  });
});
