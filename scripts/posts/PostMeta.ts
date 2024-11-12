import * as t from "io-ts";

export const PostMeta = t.intersection([
  t.strict({
    title: t.string,
    tags: t.array(t.string),
    coverImage: t.string,
    date: t.string,
  }),
  t.partial({
    oldUrl: t.string,
    openAIMikesBlogFileId: t.string,
    status: t.union([t.literal("draft"), t.literal("published")]),
    canonical: t.string,
  }),
]);

export interface PostMeta extends t.TypeOf<typeof PostMeta> {}

export const producePostMeta = (overrides: PostMeta & {}): PostMeta =>
  PostMeta.encode({
    ...overrides,
  });
