import { defineMachine } from "@convex-dev/state-machines";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import schema from "../schema";
import {
  POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS,
  POST_LIVE_CHECK_MAX_ATTEMPTS,
  POST_LIVE_CHECK_RETRY_DELAY_MS,
} from "./constants";
import { findEarlierEmailForSamePost } from "./earlierEmail";

// The email to subscribers about a new post. Everything that moves one is the server's: the upload
// script's admin functions (blogPosts/), the send action and the delivery check (internal/actions.ts),
// which report back through internal/mutations.ts, and the timers.
//
// Two things it guards against, besides an email going out before the post is live:
// - A renamed post emailed twice: LIVE only claims a campaign when no earlier email looks like this
//   same post under a slug that has since gone (earlierEmail.ts).
// - A Mailchimp campaign sent twice: each campaign has at most one Mailchimp campaign, which a retry
//   resumes after asking Mailchimp whether it already went out, and a send whose outcome is unknown
//   goes to checkingDelivery to ask, rather than failing.

const mailchimpCampaignId = { mailchimpCampaignId: v.string() };

const stuck = (what: string) => ({
  STUCK: {
    after: POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS,
    description: `An hour has passed ${what}: the action that runs it crashed or timed out.`,
  },
});

const cancel = {
  to: "cancelled",
  effect: "cancel",
  description:
    "The post was removed (deleted, or renamed to a new slug) before its email went out, so it never will.",
} as const;

const retry = {
  to: "queued",
  effect: "retry",
  description:
    "An admin retries it (retryFailedPostEmailCampaign): it sends straight away, once the post is live, resuming its Mailchimp campaign if it has one.",
} as const;

const markSent = {
  to: "sent",
  guard: "sameMailchimpCampaign",
  effect: "recordSentByHand",
  description:
    "An admin records that this Mailchimp campaign went out (markPostEmailCampaignSent), e.g. after sending it by hand.",
} as const;

export const postEmail = defineMachine(
  schema,
  {
    name: "postEmail",
    table: "postEmailCampaigns",
    description:
      "The email to subscribers about a new post: it waits until the post's page is live, then creates, fills and sends one Mailchimp campaign, and ends once, sent or not.",
    events: {
      server: {
        QUEUE: { sendAt: v.number() },
        SKIP: { reason: v.string() },
        BLOCKED: { reason: v.string() },
        NOT_LIVE: { detail: v.string() },
        LIVE: { goneFromSite: v.array(v.id("postEmailCampaigns")) },
        CAMPAIGN_CREATED: mailchimpCampaignId,
        ALREADY_SENT: {},
        CONTENT_SET: mailchimpCampaignId,
        SENDING: {},
        SENT: {},
        FAILED: { error: v.string() },
        SEND_UNCONFIRMED: { error: v.string() },
        DELIVERED: {},
        NOT_DELIVERED: { error: v.string() },
        CANCEL: { reason: v.string() },
        RETRY: { skipLiveCheck: v.boolean(), allowEarlierEmail: v.boolean() },
        MARK_SENT: mailchimpCampaignId,
      },
    },
    guards: {
      liveChecksLeft: "The post's page has been checked the most times allowed.",
      postRemoved: "The post is still on the blog.",
      noEarlierEmail:
        "Subscribers were already emailed about this post under an earlier slug: it looks like a rename.",
      sameMailchimpCampaign: "That isn't this email's Mailchimp campaign.",
    },
    states: {
      start: {
        on: {
          QUEUE: {
            to: "queued",
            effect: "queue",
            description:
              "A deploy uploads a new, recent, published post: its email waits 30 minutes for the site to finish deploying.",
          },
          SKIP: {
            to: "skipped",
            effect: "skip",
            description:
              "A new post that mustn't be emailed automatically: the upload run already queued too many (a bulk import), or Mailchimp has no API key.",
          },
        },
      },
      queued: {
        description:
          "Waiting to send at `sendAt`. A retry may carry the Mailchimp campaign it resumes, and may skip the live check or allow an earlier email.",
        timers: {
          SEND_DUE: {
            at: "sendAt",
            description: "It's time to send: the send action starts.",
          },
        },
        on: {
          SEND_DUE: {
            to: "checkingLive",
            effect: "startSend",
            description: "The send action starts by checking the post's page is live.",
          },
          CANCEL: cancel,
        },
      },
      checkingLive: {
        description:
          "The send action is checking the post's page returns 200, and that the live site no longer serves any earlier email's slug that may be this post's.",
        timers: stuck("checking the post is live"),
        on: {
          LIVE: [
            {
              to: "cancelled",
              guard: "postRemoved",
              effect: "postWasRemoved",
              description:
                "The post was removed after all (e.g. an admin retry of a renamed post's old slug, whose URL now redirects): it isn't sent, as the post's own campaign is the one that emails about it.",
            },
            {
              to: "creatingCampaign",
              guard: "noEarlierEmail",
              effect: "claim",
              description:
                "The post is live and nothing like it was emailed before: the action creates (or resumes) the Mailchimp campaign.",
            },
            {
              to: "alreadyEmailed",
              effect: "noteEarlierEmail",
              description:
                "The post is live, but subscribers were already emailed about it under a slug that's gone: a renamed post, so it isn't sent again.",
            },
          ],
          NOT_LIVE: [
            {
              to: "queued",
              guard: "liveChecksLeft",
              effect: "checkLater",
              description:
                "The page isn't live yet (or the site couldn't say about an earlier slug): check again in 10 minutes.",
            },
            {
              to: "failed",
              effect: "neverLive",
              description: "The page still isn't live after 12 checks over two hours.",
            },
          ],
          BLOCKED: {
            to: "failed",
            effect: "block",
            description:
              "This deployment mustn't email the real list (it isn't production), or Mailchimp has no API key.",
          },
          CANCEL: cancel,
          STUCK: {
            to: "failed",
            effect: "giveUpStuck",
            description:
              "The action died before claiming it. Nothing reached Mailchimp; safe to retry.",
          },
        },
      },
      creatingCampaign: {
        description:
          "Claimed: the action is creating the Mailchimp campaign, or resuming the one it has after checking Mailchimp hasn't already sent it, and setting its content.",
        timers: stuck("creating the Mailchimp campaign"),
        on: {
          CAMPAIGN_CREATED: {
            effect: "recordCampaign",
            description:
              "Mailchimp created the campaign; its ID is kept so a retry resumes it rather than making another.",
          },
          CONTENT_SET: {
            to: "contentSet",
            effect: "contentSet",
            description: "The email's HTML (the post's title and link) is set on the campaign.",
          },
          ALREADY_SENT: {
            to: "sent",
            effect: "alreadySent",
            description:
              "Resuming a campaign that Mailchimp says already went out (an earlier run died after sending): recorded as sent, not sent again.",
          },
          FAILED: {
            to: "failed",
            effect: "fail",
            description:
              "Mailchimp refused or couldn't be reached before anything was sent. Safe to retry.",
          },
          CANCEL: cancel,
          STUCK: {
            to: "failed",
            effect: "giveUpStuck",
            description:
              "The action died before sending. Safe to retry: it resumes the campaign, if one was made.",
          },
        },
      },
      contentSet: {
        description: "The campaign is ready in Mailchimp; the action is about to send it.",
        timers: stuck("with the campaign ready to send"),
        on: {
          SENDING: {
            to: "sending",
            effect: "sending",
            description: "The last check before the send: the action asks Mailchimp to send it.",
          },
          FAILED: {
            to: "failed",
            effect: "fail",
            description: "Something went wrong before the send. Safe to retry.",
          },
          CANCEL: cancel,
          STUCK: {
            to: "failed",
            effect: "giveUpStuck",
            description: "The action died before sending. Safe to retry: it resumes the campaign.",
          },
        },
      },
      sending: {
        description:
          "The action has asked Mailchimp to send the campaign. From here it can't be cancelled.",
        timers: stuck("since the send was asked for, with no answer"),
        on: {
          SENT: {
            to: "sent",
            effect: "sent",
            description: "Mailchimp accepted the send: subscribers are getting the email.",
          },
          SEND_UNCONFIRMED: {
            to: "checkingDelivery",
            effect: "checkDelivery",
            description:
              "The send call failed, which doesn't mean nothing went out (a timed-out response): ask Mailchimp.",
          },
          STUCK: {
            to: "checkingDelivery",
            effect: "checkDeliveryWhenStuck",
            description: "The action died mid-send: ask Mailchimp whether it went out.",
          },
          MARK_SENT: markSent,
        },
      },
      checkingDelivery: {
        description:
          "Not known whether the send went out: the delivery check is asking Mailchimp for the campaign's status. `error` is what went wrong.",
        timers: {
          STUCK: {
            after: POST_EMAIL_IN_PROGRESS_STUCK_AFTER_MS,
            description: "An hour has passed and Mailchimp couldn't be asked.",
          },
        },
        on: {
          DELIVERED: {
            to: "sent",
            effect: "delivered",
            description: "Mailchimp says the campaign was sent (or is sending): recorded as sent.",
          },
          NOT_DELIVERED: {
            to: "failed",
            effect: "notDelivered",
            description: "Mailchimp says the campaign hasn't gone out. Safe to retry.",
          },
          STUCK: {
            to: "failed",
            effect: "unknownDelivery",
            description:
              "Mailchimp couldn't say. A retry is still safe: it asks Mailchimp before sending anything.",
          },
          MARK_SENT: markSent,
        },
      },
      sent: {
        description: "Mailchimp sent the email to subscribers. Nothing more happens.",
      },
      failed: {
        description:
          "It didn't go out, with why. Reported at every deploy until it's retried; a retry asks Mailchimp before sending, so it never sends twice.",
        on: { RETRY: retry, MARK_SENT: markSent },
      },
      skipped: {
        description:
          "Deliberately not sent (a bulk import, or no Mailchimp key), and reported at deploy. An admin retry sends it.",
        on: { RETRY: retry },
      },
      cancelled: {
        description:
          "The post was removed before its email went out. A retry would send it anyway.",
        on: { RETRY: retry },
      },
      alreadyEmailed: {
        description:
          "Not sent: subscribers already had an email about this post under an earlier slug. If it really is a different post, a retry with allowEarlierEmail sends it.",
        on: { RETRY: retry },
      },
    },
  },
  {
    guards: {
      liveChecksLeft: (_ctx, { state }) => state.liveChecks + 1 < POST_LIVE_CHECK_MAX_ATTEMPTS,
      postRemoved: async (ctx, { row }) => (await ctx.db.get("blogPosts", row.postId)) === null,
      noEarlierEmail: async (ctx, { row, state, event }) =>
        state.allowEarlierEmail ||
        state.mailchimpCampaignId !== undefined ||
        (await findEarlierEmailForSamePost(ctx.db, row, new Set(event.goneFromSite))) === null,
      sameMailchimpCampaign: (_ctx, { state, event }) =>
        state.mailchimpCampaignId === event.mailchimpCampaignId,
    },
    effects: {
      queue: async (_ctx, { event }) => ({
        kind: "queued",
        sendAt: event.sendAt,
        liveChecks: 0,
        skipLiveCheck: false,
        allowEarlierEmail: false,
      }),
      skip: async (_ctx, { event }) => ({ kind: "skipped", reason: event.reason }),
      startSend: async (ctx, { id, state }) => {
        await ctx.scheduler.runAfter(0, internal.mailchimp.internal.actions.sendNewPostCampaign, {
          campaignId: id,
        });
        return {
          kind: "checkingLive",
          liveChecks: state.liveChecks,
          skipLiveCheck: state.skipLiveCheck,
          allowEarlierEmail: state.allowEarlierEmail,
          mailchimpCampaignId: state.mailchimpCampaignId,
        };
      },
      checkLater: async (_ctx, { state }) => ({
        kind: "queued",
        sendAt: Date.now() + POST_LIVE_CHECK_RETRY_DELAY_MS,
        liveChecks: state.liveChecks + 1,
        skipLiveCheck: state.skipLiveCheck,
        allowEarlierEmail: state.allowEarlierEmail,
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      neverLive: async (_ctx, { state, event }) => ({
        kind: "failed",
        error: `The post never went live: checked ${state.liveChecks + 1} times, last result: ${event.detail}`,
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      block: async (_ctx, { state, event }) => ({
        kind: "failed",
        error: `Not sent: ${event.reason}`,
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      claim: async (_ctx, { state }) => ({
        kind: "creatingCampaign",
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      noteEarlierEmail: async (ctx, { row, event }) => {
        const earlier = await findEarlierEmailForSamePost(ctx.db, row, new Set(event.goneFromSite));
        if (!earlier) throw new Error("noEarlierEmail refused, but no earlier email was found");
        return {
          kind: "alreadyEmailed",
          earlierCampaignId: earlier._id,
          earlierSlug: earlier.slug,
        };
      },
      recordCampaign: async (_ctx, { event }) => ({
        kind: "creatingCampaign",
        mailchimpCampaignId: event.mailchimpCampaignId,
      }),
      contentSet: async (_ctx, { event }) => ({
        kind: "contentSet",
        mailchimpCampaignId: event.mailchimpCampaignId,
      }),
      alreadySent: async (_ctx, { state }) => ({
        kind: "sent",
        sentAt: Date.now(),
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      fail: async (_ctx, { state, event }) => ({
        kind: "failed",
        error: event.error,
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      giveUpStuck: async (_ctx, { from, state }) => ({
        kind: "failed",
        error: `Stuck in '${from}' for an hour; the send action probably crashed or timed out. Safe to retry.`,
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      sending: async (_ctx, { state }) => ({
        kind: "sending",
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      sent: async (_ctx, { state }) => ({
        kind: "sent",
        sentAt: Date.now(),
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      checkDelivery: async (ctx, { id, state, event }) => {
        await ctx.scheduler.runAfter(
          0,
          internal.mailchimp.internal.actions.checkPostEmailDelivery,
          {
            campaignId: id,
          },
        );
        return {
          kind: "checkingDelivery",
          mailchimpCampaignId: state.mailchimpCampaignId,
          error: event.error,
        };
      },
      checkDeliveryWhenStuck: async (ctx, { id, state }) => {
        await ctx.scheduler.runAfter(
          0,
          internal.mailchimp.internal.actions.checkPostEmailDelivery,
          {
            campaignId: id,
          },
        );
        return {
          kind: "checkingDelivery",
          mailchimpCampaignId: state.mailchimpCampaignId,
          error: "The send action died mid-send.",
        };
      },
      delivered: async (_ctx, { state }) => ({
        kind: "sent",
        sentAt: Date.now(),
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      notDelivered: async (_ctx, { state, event }) => ({
        kind: "failed",
        error: `${state.error} (Mailchimp says it wasn't sent: ${event.error})`,
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      unknownDelivery: async (_ctx, { state }) => ({
        kind: "failed",
        error: `${state.error} Mailchimp couldn't say whether it went out; a retry asks again before sending.`,
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      recordSentByHand: async (_ctx, { event }) => ({
        kind: "sent",
        sentAt: Date.now(),
        mailchimpCampaignId: event.mailchimpCampaignId,
      }),
      // Both keep the Mailchimp campaign: a cancelled retry may have sent on an earlier run, and
      // rename detection needs to know (earlierEmail.ts)
      cancel: async (_ctx, { state, event }) => ({
        kind: "cancelled",
        reason: event.reason,
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      postWasRemoved: async (_ctx, { state }) => ({
        kind: "cancelled",
        reason: "Not sent: the post was removed before its email went out",
        mailchimpCampaignId: state.mailchimpCampaignId,
      }),
      retry: async (_ctx, { state, event }) => ({
        kind: "queued",
        sendAt: Date.now(),
        liveChecks: 0,
        skipLiveCheck: event.skipLiveCheck,
        allowEarlierEmail: event.allowEarlierEmail,
        mailchimpCampaignId: "mailchimpCampaignId" in state ? state.mailchimpCampaignId : undefined,
      }),
    },
  },
);
