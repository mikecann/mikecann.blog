export interface AlgoliaHit extends Record<string, unknown> {
  excerpt: string;
  title: string;
  coverImage: string;
  createdAt: number;
  objectID: string;
  slug: string;
}
