import { v } from "convex/values";
import { internalQuery, query, QueryCtx } from "../../_generated/server";
import { ensureFP } from "../../../essentials/misc/ensure";
import { Doc } from "../../_generated/dataModel";
import { isNotNullOrUndefined } from "../../../essentials/misc/filter";

export interface BlogPostMatch {
  blogPost: {
    title: string;
    slug: string;
    url: string;
  };
  chunkContent: string;
}

// Helper to convert a chunk and its post to BlogPostMatch
async function chunkToBlogPostMatch(
  ctx: QueryCtx,
  chunk: Doc<"blogPostChunks">,
): Promise<BlogPostMatch> {
  const post = await ctx.db
    .get(chunk.postId)
    .then(ensureFP(`Blog post not found with id ${chunk.postId}`));

  return {
    blogPost: {
      title: post.title,
      slug: post.slug,
      url: `https://www.mikecann.blog/posts/${post.slug}`,
    },
    chunkContent: chunk.content,
  };
}

export const textSearchBlogPosts = internalQuery({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args): Promise<BlogPostMatch[]> => {
    const chunks = await ctx.db
      .query("blogPostChunks")
      .withSearchIndex("search_content", (q) => q.search("content", args.query))
      .take(10);

    console.log(`text search for '${args.query}' turned up these chunks: `, chunks);

    const matches = await Promise.all(chunks.map((chunk) => chunkToBlogPostMatch(ctx, chunk)));
    return matches;
  },
});

export const getBlogPostChunksByIds = internalQuery({
  args: {
    ids: v.array(v.id("blogPostChunks")),
  },
  handler: async (ctx, args): Promise<BlogPostMatch[]> => {
    const results = await Promise.all(
      args.ids.map(async (id) => {
        const chunk = await ctx.db.get(id);
        if (!chunk) return null;
        return chunkToBlogPostMatch(ctx, chunk);
      }),
    );
    return results.filter(isNotNullOrUndefined);
  },
});
