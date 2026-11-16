/**
 * The blog's Cloudflare Worker. Every page is a static file served straight from the Worker's
 * assets; this only runs for requests that don't match one:
 *
 * - /api/activity: my newest videos and X posts, for the activity panels.
 * - Old WordPress-era post URLs (each post's `oldUrl`), redirected to the post.
 * - Legacy WordPress media and Flash folders, proxied from the old CloudFront and S3 buckets.
 * - Anything else gets the 404 page.
 */
import { getActivity } from "../scripts/activity";
import type { ActivityResponse } from "../utils/activity";
import redirects from "./redirects.generated.json";

interface Env {
  ASSETS: Fetcher;
}

const oldUrlRedirects = redirects as Record<string, string>;

// Enough for the newest video and X posts even after a post's own ones are left out.
const maxVideos = 3;
const maxXPosts = 10;

// Paths from the WordPress days, still linked from old posts. CloudFront serves most of them; a
// few folders 404 there but exist directly in the S3 bucket.
const cloudfrontOrigin = "https://d18l99bmg6trdn.cloudfront.net";
const s3Origin = "https://mikecann-web-wordpress.s3.amazonaws.com";
const legacyOrigins: [prefix: string, origin: string][] = [
  ["/wp-content/", cloudfrontOrigin],
  ["/flash/", cloudfrontOrigin],
  ["/DumpingGround/", cloudfrontOrigin],
  ["/projects/", s3Origin],
  ["/ArtificialStudios1/", s3Origin],
  ["/Files/", s3Origin],
  ["/Work/", s3Origin],
];

/** Without a trailing slash, and decoded, the way the redirect map is keyed. */
const normalisePath = (pathname: string) => {
  const trimmed = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

/**
 * The portfolio is asked about once an hour, not once per visitor: the response is kept in
 * Cloudflare's cache for an hour, or a minute if part of it couldn't be reached so a blip doesn't
 * leave the older snapshot showing for the next hour.
 */
const handleActivity = async (request: Request, ctx: ExecutionContext) => {
  const cache = caches.default;
  const cacheKey = new Request(new URL("/api/activity", request.url).toString());
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const { items, failed } = await getActivity();
  const body: ActivityResponse = {
    items: [
      ...items.filter((item) => item.kind == "video").slice(0, maxVideos),
      ...items.filter((item) => item.kind == "x").slice(0, maxXPosts),
    ],
  };
  const response = Response.json(body, {
    headers: { "Cache-Control": failed ? "public, max-age=60" : "public, max-age=3600" },
  });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
};

const proxyLegacy = (url: URL, origin: string) =>
  fetch(`${origin}${url.pathname}${url.search}`, {
    // These files never change, so let Cloudflare keep them for a month.
    cf: { cacheEverything: true, cacheTtl: 30 * 24 * 60 * 60 },
  });

// The security headers public/_headers gives the static assets, for the responses made here.
const securityHeaders: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
};

const withSecurityHeaders = (response: Response) => {
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(securityHeaders)) secured.headers.set(name, value);
  return secured;
};

const route = async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
  const url = new URL(request.url);

  if (url.pathname == "/api/activity") return handleActivity(request, ctx);

  const destination = oldUrlRedirects[normalisePath(url.pathname)];
  if (destination) return Response.redirect(new URL(destination, url).toString(), 308);

  const legacy = legacyOrigins.find(([prefix]) => url.pathname.startsWith(prefix));
  if (legacy) return proxyLegacy(url, legacy[1]);

  // Not a page or file we have: the assets binding answers with 404.html and a 404 status.
  return env.ASSETS.fetch(request);
};

export default {
  fetch: async (request, env, ctx) => withSecurityHeaders(await route(request, env, ctx)),
} satisfies ExportedHandler<Env>;
