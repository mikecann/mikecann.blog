import { describe, expect, it } from "vitest";
import { mergeActivityItems, type ActivityItem } from "./activity";
import { parseIsoDuration, toVideoItem, toXPostItem } from "./liveActivity";

describe("parseIsoDuration", () => {
  it("reads YouTube durations", () => {
    expect(parseIsoDuration("PT37M50S")).toBe(2270);
    expect(parseIsoDuration("PT1H2M5S")).toBe(3725);
    expect(parseIsoDuration("PT59S")).toBe(59);
  });

  it("ignores anything else", () => {
    expect(parseIsoDuration("PT")).toBeUndefined();
    expect(parseIsoDuration("P1D")).toBeUndefined();
  });
});

describe("toVideoItem", () => {
  const video = {
    youtubeId: "pHrxmSjxLg8",
    title: "Your database is lying to you about time",
    publishedAt: "2026-10-27T15:30:22Z",
    duration: "PT37M50S",
  };

  it("maps a portfolio video", () => {
    expect(toVideoItem(video)).toEqual({
      kind: "video",
      id: "pHrxmSjxLg8",
      date: "2026-10-27T15:30:22.000Z",
      title: "Your database is lying to you about time",
      durationSeconds: 2270,
    });
  });

  it("skips Shorts", () => {
    expect(toVideoItem({ ...video, duration: "PT2M51S" })).toBeNull();
    expect(toVideoItem({ ...video, duration: "PT3M" })).not.toBeNull();
  });

  it("keeps a video without a duration", () => {
    expect(toVideoItem({ ...video, duration: undefined })?.durationSeconds).toBeUndefined();
  });

  it("skips bad ids and dates", () => {
    expect(toVideoItem({ ...video, youtubeId: "videoseries1" })).toBeNull();
    expect(toVideoItem({ ...video, publishedAt: "soon" })).toBeNull();
  });
});

describe("toXPostItem", () => {
  const tweet = {
    tweetId: "2109121694405406894",
    text: "Should I stop using generated cartoon videos in my videos?",
    publishedAt: "2026-10-11T03:19:32.000Z",
    likeCount: 12,
  };

  it("maps a portfolio X post with its own link", () => {
    expect(toXPostItem(tweet)).toEqual({
      kind: "x",
      date: "2026-10-11T03:19:32.000Z",
      text: "Should I stop using generated cartoon videos in my videos?",
      url: "https://x.com/mikeysee/status/2109121694405406894",
      likes: 12,
    });
  });

  it("skips replies and reposts", () => {
    expect(toXPostItem({ ...tweet, text: "@barre_of_lube @convex Looks good mate!" })).toBeNull();
    expect(toXPostItem({ ...tweet, text: "RT @convex: Convex 1.48 is out" })).toBeNull();
  });

  it("skips replies in my own threads, which don't start with @", () => {
    const threadReply = { ...tweet, text: 'This was on the "no guidelines" category:' };
    expect(toXPostItem({ ...threadReply, isReply: true })).toBeNull();
    expect(toXPostItem({ ...threadReply, isReply: false })).not.toBeNull();
  });

  it("decodes entities and drops trailing media links", () => {
    expect(
      toXPostItem({ ...tweet, text: "Convex &amp; Claude &lt;3 https://t.co/S0Z8vvoDWW" })?.text,
    ).toBe("Convex & Claude <3");
    expect(
      toXPostItem({
        ...tweet,
        text: "Ye I really like where this is going https://t.co/8uUTCD7SSr https://t.co/FezmehUAt0",
      })?.text,
    ).toBe("Ye I really like where this is going");
    expect(
      toXPostItem({ ...tweet, text: "Full video here: https://t.co/S0Z8vvoDWW BTW" })?.text,
    ).toBe("Full video here: https://t.co/S0Z8vvoDWW BTW");
  });

  it("skips a post that's only a link", () => {
    expect(toXPostItem({ ...tweet, text: "https://t.co/S0Z8vvoDWW" })).toBeNull();
  });
});

describe("mergeActivityItems", () => {
  const snapshot: ActivityItem[] = [
    {
      kind: "x",
      date: "2026-10-18T12:00:00.000Z",
      text: "Only in the snapshot",
      url: "https://x.com/mikeysee",
    },
    {
      kind: "x",
      date: "2026-10-11T08:00:00.000Z",
      text: "Introducing: Let's Build It!",
      url: "https://x.com/mikeysee",
      post: "introducing-lets-build-it",
    },
    { kind: "video", id: "2jGiVHdQUkE", date: "2026-10-10T15:00:00.000Z", title: "Old title" },
  ];

  const live: ActivityItem[] = [
    { kind: "video", id: "pHrxmSjxLg8", date: "2026-10-27T15:30:22.000Z", title: "New video" },
    {
      kind: "x",
      date: "2026-10-11T08:12:34.000Z",
      text: "Introducing: Let's Build It! https://t.co/abc",
      url: "https://x.com/mikeysee/status/123",
      likes: 32,
    },
    {
      kind: "video",
      id: "2jGiVHdQUkE",
      date: "2026-10-10T15:00:00.000Z",
      title: "Let's build a database!",
      durationSeconds: 2280,
    },
  ];

  it("prefers live copies, keeps their post links, and keeps snapshot-only items", () => {
    expect(mergeActivityItems(snapshot, live)).toEqual([
      live[0],
      snapshot[0],
      { ...live[1], post: "introducing-lets-build-it" },
      live[2],
    ]);
  });

  it("falls back to the snapshot when there's nothing live", () => {
    expect(mergeActivityItems(snapshot, [])).toEqual(snapshot);
  });

  it("keeps a page's newer built items when the API only has the snapshot", () => {
    const built = [live[0], { ...live[1], post: "introducing-lets-build-it" }];
    const merged = mergeActivityItems(built, snapshot);

    expect(merged[0]).toEqual(live[0]);
    expect(merged.filter((item) => item.kind == "x")).toHaveLength(2);
  });
});
