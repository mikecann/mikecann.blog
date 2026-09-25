/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as blogPosts_admin_actions from "../blogPosts/admin/actions.js";
import type * as blogPosts_admin_mutations from "../blogPosts/admin/mutations.js";
import type * as blogPosts_admin_queries from "../blogPosts/admin/queries.js";
import type * as blogPosts_internal_mutations from "../blogPosts/internal/mutations.js";
import type * as blogPosts_internal_queries from "../blogPosts/internal/queries.js";
import type * as blogPosts_lib from "../blogPosts/lib.js";
import type * as builder from "../builder.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as mailchimp_admin_mutations from "../mailchimp/admin/mutations.js";
import type * as mailchimp_campaigns from "../mailchimp/campaigns.js";
import type * as mailchimp_constants from "../mailchimp/constants.js";
import type * as mailchimp_emailTemplate from "../mailchimp/emailTemplate.js";
import type * as mailchimp_internal_actions from "../mailchimp/internal/actions.js";
import type * as mailchimp_internal_mutations from "../mailchimp/internal/mutations.js";
import type * as mailchimp_internal_queries from "../mailchimp/internal/queries.js";
import type * as mailchimp_lib from "../mailchimp/lib.js";
import type * as mikebot_config from "../mikebot/config.js";
import type * as mikebot_constants from "../mikebot/constants.js";
import type * as mikebot_guards from "../mikebot/guards.js";
import type * as mikebot_internal_actions from "../mikebot/internal/actions.js";
import type * as mikebot_internal_mutations from "../mikebot/internal/mutations.js";
import type * as mikebot_lib from "../mikebot/lib.js";
import type * as mikebot_mutations from "../mikebot/mutations.js";
import type * as mikebot_queries from "../mikebot/queries.js";
import type * as mikebot_sha256 from "../mikebot/sha256.js";
import type * as mikebot_shared from "../mikebot/shared.js";
import type * as newsletter_lib from "../newsletter/lib.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "blogPosts/admin/actions": typeof blogPosts_admin_actions;
  "blogPosts/admin/mutations": typeof blogPosts_admin_mutations;
  "blogPosts/admin/queries": typeof blogPosts_admin_queries;
  "blogPosts/internal/mutations": typeof blogPosts_internal_mutations;
  "blogPosts/internal/queries": typeof blogPosts_internal_queries;
  "blogPosts/lib": typeof blogPosts_lib;
  builder: typeof builder;
  crons: typeof crons;
  http: typeof http;
  "mailchimp/admin/mutations": typeof mailchimp_admin_mutations;
  "mailchimp/campaigns": typeof mailchimp_campaigns;
  "mailchimp/constants": typeof mailchimp_constants;
  "mailchimp/emailTemplate": typeof mailchimp_emailTemplate;
  "mailchimp/internal/actions": typeof mailchimp_internal_actions;
  "mailchimp/internal/mutations": typeof mailchimp_internal_mutations;
  "mailchimp/internal/queries": typeof mailchimp_internal_queries;
  "mailchimp/lib": typeof mailchimp_lib;
  "mikebot/config": typeof mikebot_config;
  "mikebot/constants": typeof mikebot_constants;
  "mikebot/guards": typeof mikebot_guards;
  "mikebot/internal/actions": typeof mikebot_internal_actions;
  "mikebot/internal/mutations": typeof mikebot_internal_mutations;
  "mikebot/lib": typeof mikebot_lib;
  "mikebot/mutations": typeof mikebot_mutations;
  "mikebot/queries": typeof mikebot_queries;
  "mikebot/sha256": typeof mikebot_sha256;
  "mikebot/shared": typeof mikebot_shared;
  "newsletter/lib": typeof newsletter_lib;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  agent: import("@convex-dev/agent/_generated/component.js").ComponentApi<"agent">;
  rag: import("@convex-dev/rag/_generated/component.js").ComponentApi<"rag">;
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
