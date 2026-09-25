const fs = require("fs");
const { join } = require("path");
const matter = require("gray-matter");

const postsDirectory = join(process.cwd(), "public/posts");

// Keep in sync with `shouldIncludeDrafts` in scripts/posts/index.ts.
const includeDrafts =
  process.env.VERCEL_ENV != "production" &&
  (process.env.NODE_ENV == "development" || process.env.INCLUDE_DRAFTS == "1");

// Keep in sync with MEDIA_EXTENSIONS in utils/assets.ts. Both cases, since route matching on the
// CDN may be case sensitive.
const mediaExtensions = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "avif",
  "mp4",
  "m4v",
  "webm",
  "mov",
  "mp3",
  "zip",
  "pdf",
].flatMap((ext) => [ext, ext.toUpperCase()]);

// Matches files inside a post's folder (`/posts/<slug>/<file>`), never the `/posts/<slug>` page.
const postMediaSource = `/posts/:slug/:file(.+\\.(?:${mediaExtensions.join("|")}))`;

// When set (e.g. https://assets.mikecann.blog), post media and thumbnails are served from there.
const assetBaseUrl = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || "").replace(/\/+$/, "");

// convex.mikecann.blog proxies a separate site (see rewrites); leave its responses alone.
const notConvexPortfolio = [{ type: "host", value: "convex.mikecann.blog" }];

const mediaCacheHeaders = [
  // Browsers: a day fresh, then serve stale while revalidating for a week.
  { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
  // Cloudflare in front of Vercel: cache for 30 days instead of revalidating on every hit.
  { key: "CDN-Cache-Control", value: "public, max-age=2592000" },
];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

module.exports = {
  // Post metadata is read during static generation, but file tracing cannot tell that
  // the hundreds of media assets beside post.md are never needed by a server function.
  // Keeping them in the trace pushes Vercel functions over its uncompressed size limit.
  outputFileTracingExcludes: {
    "/*": ["public/posts/**/*.{gif,jpeg,jpg,m4v,mp4,png,webp,zip}"],
  },

  images: {
    // Vercel image optimization is deliberately disabled (cost).
    unoptimized: true,
    // `quality` does nothing while unoptimized, but old HTML (caches, crawlers) still requests
    // /_next/image with these q values; they must stay allowed (see 3fc52eb).
    qualities: [75, 80, 100],
  },

  async headers() {
    return [
      { source: "/:path*", missing: notConvexPortfolio, headers: securityHeaders },
      { source: postMediaSource, missing: notConvexPortfolio, headers: mediaCacheHeaders },
      { source: "/thumbs/:path*", missing: notConvexPortfolio, headers: mediaCacheHeaders },
      { source: "/images/:path*", missing: notConvexPortfolio, headers: mediaCacheHeaders },
    ];
  },

  async redirects() {
    const redirects = [];

    for (const entry of fs.readdirSync(postsDirectory, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const slug = entry.name;
      const { data } = matter(fs.readFileSync(join(postsDirectory, slug, "post.md"), "utf8"));

      if (!data.oldUrl) continue;
      if (data.status == "draft" && !includeDrafts) continue;

      redirects.push({
        source: data.oldUrl,
        destination: `/posts/${slug}`,
        permanent: true,
      });
    }

    if (assetBaseUrl) {
      redirects.push(
        {
          source: postMediaSource,
          destination: `${assetBaseUrl}/posts/:slug/:file`,
          permanent: true,
        },
        {
          source: "/thumbs/:file*",
          destination: `${assetBaseUrl}/thumbs/:file*`,
          permanent: true,
        },
      );
    }

    return redirects;
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [
            {
              type: "host",
              value: "convex.mikecann.blog",
            },
          ],
          destination: "https://mikes-convex-portfolio.mikeysee.workers.dev/:path*",
        },
      ],
      afterFiles: [
        {
          source: "/wp-content/:splat*",
          destination: "https://d18l99bmg6trdn.cloudfront.net/wp-content/:splat*",
        },
        {
          source: "/flash/:splat*",
          destination: "https://d18l99bmg6trdn.cloudfront.net/flash/:splat*",
        },
        {
          source: "/DumpingGround/:splat*",
          destination: "https://d18l99bmg6trdn.cloudfront.net/DumpingGround/:splat*",
        },
        // These paths 404 on CloudFront but exist directly in S3
        {
          source: "/projects/:splat*",
          destination: "https://mikecann-web-wordpress.s3.amazonaws.com/projects/:splat*",
        },
        {
          source: "/ArtificialStudios1/:splat*",
          destination: "https://mikecann-web-wordpress.s3.amazonaws.com/ArtificialStudios1/:splat*",
        },
        {
          source: "/Files/:splat*",
          destination: "https://mikecann-web-wordpress.s3.amazonaws.com/Files/:splat*",
        },
        {
          source: "/Work/:splat*",
          destination: "https://mikecann-web-wordpress.s3.amazonaws.com/Work/:splat*",
        },
      ],
    };
  },
};
