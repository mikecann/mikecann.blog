import { v } from "convex/values";
import { convex } from "../../builder";
import {
  mailchimpFetch,
  generateNewPostEmailHtml,
  MAILCHIMP_LIST_ID,
  MAILCHIMP_FROM_NAME,
  MAILCHIMP_REPLY_TO,
} from "../lib";

export const sendNewPostCampaign = convex
  .action()
  .input({
    slug: v.string(),
    title: v.string(),
  })
  .handler(async (ctx, { slug, title }) => {
    console.log(`Creating Mailchimp campaign for new post: "${title}" (${slug})`);

    const campaign = await mailchimpFetch("/campaigns", {
      method: "POST",
      body: JSON.stringify({
        type: "regular",
        recipients: { list_id: MAILCHIMP_LIST_ID },
        settings: {
          subject_line: `New Blog Post: ${title}`,
          from_name: MAILCHIMP_FROM_NAME,
          reply_to: MAILCHIMP_REPLY_TO,
        },
      }),
    });

    console.log(`Campaign created: ${campaign.id}`);

    await mailchimpFetch(`/campaigns/${campaign.id}/content`, {
      method: "PUT",
      body: JSON.stringify({
        html: generateNewPostEmailHtml(title, slug),
      }),
    });

    console.log(`Campaign content set, sending...`);

    await mailchimpFetch(`/campaigns/${campaign.id}/actions/send`, {
      method: "POST",
    });

    console.log(`Campaign sent successfully for post: "${title}"`);
  })
  .internal();
