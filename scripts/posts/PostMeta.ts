import { z } from "zod";

export const PostMetaSchema = z.object({
  title: z.string().min(1),
  tags: z.array(z.string()),
  coverImage: z.string().min(1),
  date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "must be a valid ISO date string"),
  oldUrl: z.string().optional(),
  status: z.enum(["draft", "published"]).optional(),
  canonical: z.string().optional(),
});

export type PostMeta = z.infer<typeof PostMetaSchema>;

const formatIssues = (error: z.ZodError) =>
  error.issues
    .map((issue) => `  - ${issue.path.length ? issue.path.join(".") : "(root)"}: ${issue.message}`)
    .join("\n");

/**
 * Validates a post's frontmatter, throwing an error that names the offending post.
 */
export const producePostMeta = (data: unknown, postName = "unknown post"): PostMeta => {
  const result = PostMetaSchema.safeParse(data);
  if (!result.success)
    throw new Error(`Invalid frontmatter in post "${postName}":\n${formatIssues(result.error)}`);
  return result.data;
};
