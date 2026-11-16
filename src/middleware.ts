import { defineMiddleware } from "astro:middleware";
import { getStyles } from "typestyle";

/** Placeholder in Base.astro that the page's typestyle CSS replaces. */
export const TYPESTYLE_PLACEHOLDER = "<!--typestyle-->";

/**
 * The components style themselves with typestyle, which collects CSS as they render. The head is
 * written before the body renders, so the CSS goes in once the whole page has rendered, the way
 * Next's _document did with getStyles().
 */
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get("content-type")?.includes("text/html")) return response;
  const html = await response.text();
  return new Response(html.replace(TYPESTYLE_PLACEHOLDER, getStyles()), {
    status: response.status,
    headers: response.headers,
  });
});
