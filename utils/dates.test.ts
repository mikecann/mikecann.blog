import { describe, expect, it } from "vitest";
import { formatUTCDate } from "./dates";
import { getPostYear } from "./posts";

describe("formatUTCDate", () => {
  it("formats the UTC calendar date", () => {
    expect(formatUTCDate("2026-09-18T00:00:00.000Z")).toBe("18th September 2026");
    expect(formatUTCDate("2026-09-18T23:59:59.000Z")).toBe("18th September 2026");
    expect(formatUTCDate("2008-01-01T00:00:00.000Z", "do MMMM")).toBe("1st January");
  });

  it("accepts timestamps", () => {
    expect(formatUTCDate(Date.UTC(2024, 1, 29))).toBe("29th February 2024");
  });
});

describe("getPostYear", () => {
  it("uses the UTC year", () => {
    const post = (date: string) => ({
      slug: "a",
      meta: { title: "a", tags: [], coverImage: "./a.png", date },
    });
    expect(getPostYear(post("2009-01-01T00:00:00.000Z"))).toBe(2009);
    expect(getPostYear(post("2008-12-31T23:30:00.000Z"))).toBe(2008);
  });
});
