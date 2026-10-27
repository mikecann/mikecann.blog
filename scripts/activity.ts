import { z } from "zod";
import rawActivity from "../data/activity.json";

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), "must be a valid ISO date string");

export const XPostSchema = z.object({
  kind: z.literal("x"),
  date: isoDate,
  text: z.string().min(1),
  url: z.url(),
  likes: z.number().optional(),
  /** Slug of the blog post this X post is about, if any. */
  post: z.string().optional(),
});

export const VideoSchema = z.object({
  kind: z.literal("video"),
  /** The YouTube video id. */
  id: z.string().min(1),
  date: isoDate,
  title: z.string().min(1),
  durationSeconds: z.number().optional(),
  /** Slug of the blog post this video is about, if any. */
  post: z.string().optional(),
});

const ActivitySchema = z.object({
  items: z.array(z.discriminatedUnion("kind", [XPostSchema, VideoSchema])),
});

export type XPost = z.infer<typeof XPostSchema>;
export type Video = z.infer<typeof VideoSchema>;
export type ActivityItem = XPost | Video;

/**
 * Mike's recent X posts and YouTube videos, newest first.
 *
 * Read from `data/activity.json`, a hand-collected snapshot for now. A scheduled sync can
 * rewrite that file (or replace this function) without touching the components.
 */
export const getActivityItems = (): ActivityItem[] =>
  [...ActivitySchema.parse(rawActivity).items].sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
