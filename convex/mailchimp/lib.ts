import { ensure } from "../../essentials/misc/ensure";
import { EMAIL_TEMPLATE } from "./emailTemplate";

export const MAILCHIMP_LIST_ID = "3c8f7e6e85";
export const MAILCHIMP_FROM_NAME = "Mike Cann";
export const MAILCHIMP_REPLY_TO = "mike.cann@gmail.com";

export function sanitizeMailchimpApiKey(apiKey: string): string {
  return apiKey.trim().replace(/^["']+|["']+$/g, "");
}

export function getMailchimpDataCenter(apiKey: string): string {
  const dc = apiKey.split("-").pop();
  if (!dc || !/^[a-z]+\d+$/i.test(dc)) {
    throw new Error("MAILCHIMP_API_KEY env var does not include a valid Mailchimp data center");
  }
  return dc;
}

function getMailchimpConfig() {
  const apiKey = sanitizeMailchimpApiKey(
    ensure(process.env.MAILCHIMP_API_KEY, "MAILCHIMP_API_KEY env var is not set"),
  );
  const dc = getMailchimpDataCenter(apiKey);
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
