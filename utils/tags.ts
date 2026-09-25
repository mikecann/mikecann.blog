/** The `[tag]` route param for a tag (unencoded; Next encodes route params itself). */
export const tagToParam = (tag: string) => tag.replace(/#/g, "sharp");

/** URL path of a tag's page, e.g. `/tags/raspberry%20pi`. */
export const tagPath = (tag: string) => `/tags/${encodeURIComponent(tagToParam(tag))}`;
