import { ensure } from "../../essentials/misc/ensure";
import { EMAIL_TEMPLATE } from "./emailTemplate";

export const MAILCHIMP_LIST_ID = "3c8f7e6e85";
export const MAILCHIMP_FROM_NAME = "Mike Cann";
export const MAILCHIMP_REPLY_TO = "mike.cann@gmail.com";

function getMailchimpConfig() {
  const apiKey = ensure(process.env.MAILCHIMP_API_KEY, "MAILCHIMP_API_KEY env var is not set");
  const dc = apiKey.split("-").pop();
  return { apiKey, dc, baseUrl: `https://${dc}.api.mailchimp.com/3.0` };
}

export async function mailchimpFetch(path: string, options: RequestInit = {}) {
  const { apiKey, baseUrl } = getMailchimpConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Basic ${btoa(`anystring:${apiKey}`)}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mailchimp API error ${response.status}: ${body}`);
  }
  return response.json();
}

export function generateNewPostEmailHtml(title: string, slug: string): string {
  const postUrl = `https://mikecann.blog/posts/${slug}`;
  return EMAIL_TEMPLATE.replace(/\{\{POST_TITLE\}\}/g, title).replace(
    /\{\{POST_URL\}\}/g,
    postUrl,
  );
}
