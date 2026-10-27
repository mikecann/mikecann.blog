import { describe, expect, it } from "vitest";
import {
  buildPostActivity,
  findEmbeddedYouTubeId,
  formatAgo,
  formatDuration,
  type ActivityItem,
  type NewerPost,
} from "./activity";

const items: ActivityItem[] = [
  { kind: "x", date: "2026-10-16T06:00:00.000Z", text: "newest x", url: "https://x.com/a" },
  { kind: "video", id: "newestVideo", date: "2026-10-10T15:00:00.000Z", title: "Newest video" },
  {
    kind: "x",
    date: "2026-08-05T20:00:00.000Z",
    text: "about the touchscreen",
    url: "https://x.com/b",
    post: "touchscreen",
  },
  {
    kind: "video",
    id: "ubRYvl4gfGE",
    date: "2026-08-05T19:03:23.000Z",
    title: "I built my family a giant touchscreen",
    durationSeconds: 1388,
  },
  { kind: "x", date: "2026-07-01T00:00:00.000Z", text: "older x", url: "https://x.com/c" },
];

const newerPost: NewerPost = {
  kind: "post",
  slug: "a-big-week-in-sf",
  title: "A Big Week in SF",
  date: "2026-09-18T00:00:00.000Z",
  image: "/thumbs/a-big-week-in-sf.webp",
};

const touchscreenMarkdown = `Some words.

<iframe src="https://www.youtube.com/embed/ubRYvl4gfGE" allowfullscreen></iframe>`;

describe("findEmbeddedYouTubeId", () => {
  it("finds the first embedded video", () => {
    expect(findEmbeddedYouTubeId(touchscreenMarkdown)).toBe("ubRYvl4gfGE");
    expect(
      findEmbeddedYouTubeId(`<iframe src="https://www.youtube-nocookie.com/embed/abcdefghijk">`),
    ).toBe("abcdefghijk");
  });

  it("ignores posts without an embed", () => {
    expect(findEmbeddedYouTubeId("Watch it at https://youtu.be/ubRYvl4gfGE")).toBeUndefined();
  });

  it("ignores playlist embeds", () => {
    const playlist = `<iframe src="https://www.youtube.com/embed/videoseries?list=PLdFGn0KeUCYer1aL7cEzpcDIg51vycrio"></iframe>`;
    expect(findEmbeddedYouTubeId(playlist)).toBeUndefined();
    expect(findEmbeddedYouTubeId(`${playlist}\n\n${touchscreenMarkdown}`)).toBe("ubRYvl4gfGE");
  });

  it("ignores ids that aren't 11 characters", () => {
    expect(
      findEmbeddedYouTubeId(`<iframe src="https://www.youtube.com/embed/Avxrg1YavBIg">`),
    ).toBeUndefined();
  });
});

describe("formatDuration", () => {
  it("formats minutes and hours", () => {
    expect(formatDuration(2280)).toBe("38:00");
    expect(formatDuration(340)).toBe("5:40");
    expect(formatDuration(3725)).toBe("1:02:05");
  });
});

describe("formatAgo", () => {
  const now = Date.parse("2026-10-19T06:00:00.000Z");

  it("uses short relative times for the last week", () => {
    expect(formatAgo("2026-10-19T05:30:00.000Z", now)).toBe("30m");
    expect(formatAgo("2026-10-18T12:00:00.000Z", now)).toBe("18h");
    expect(formatAgo("2026-10-16T06:00:00.000Z", now)).toBe("3d");
  });

  it("falls back to a date after a week", () => {
    expect(formatAgo("2026-10-01T06:00:00.000Z", now)).toBe("1 Oct");
  });
});

describe("buildPostActivity", () => {
  it("links the embedded video and the X post about the post", () => {
    const activity = buildPostActivity({
      slug: "touchscreen",
      date: "2026-08-06T07:31:40.000Z",
      title: "I built my family a giant touchscreen",
      markdown: touchscreenMarkdown,
      items,
      newerPosts: [newerPost],
    });

    expect(activity.elsewhere.video?.durationSeconds).toBe(1388);
    expect(activity.elsewhere.xPost?.text).toBe("about the touchscreen");
    // The related items aren't repeated in the general feed.
    expect(activity.latestVideo?.id).toBe("newestVideo");
    expect(activity.latestXPosts.map((x) => x.text)).toEqual(["newest x", "older x"]);
    expect(activity.since.map((item) => item.title)).toEqual(["Newest video", "A Big Week in SF"]);
  });

  it("still links an embedded video that isn't in the activity data", () => {
    const activity = buildPostActivity({
      slug: "other",
      date: "2026-01-01T00:00:00.000Z",
      title: "Other post",
      markdown: `<iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>`,
      items,
      newerPosts: [],
    });

    expect(activity.elsewhere.video).toEqual({
      kind: "video",
      id: "abcdefghijk",
      date: "2026-01-01T00:00:00.000Z",
      title: "Other post",
    });
    expect(activity.elsewhere.xPost).toBeNull();
  });

  it("has nothing since the newest post", () => {
    const activity = buildPostActivity({
      slug: "newest",
      date: "2026-10-18T00:00:00.000Z",
      title: "Newest",
      markdown: "",
      items,
      newerPosts: [],
    });

    expect(activity.since).toEqual([]);
    expect(activity.elsewhere).toEqual({ video: null, xPost: null });
  });
});
