import { afterEach, describe, expect, test, vi } from "vitest";
import keyFile from "../../public/bac03a698e38dcc31173aeb0a2de4001.txt?raw";
import { INDEXNOW_KEY, notifyIndexNow } from "./indexNow";

afterEach(() => vi.restoreAllMocks());

describe("IndexNow", () => {
  test("the site serves the key file search engines verify", () => {
    expect(keyFile.trim()).toBe(INDEXNOW_KEY);
  });

  test("submits the URL with the key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null));
    await notifyIndexNow("https://mikecann.blog/posts/hello world");
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.indexnow.org/indexnow?url=https%3A%2F%2Fmikecann.blog%2Fposts%2Fhello%20world&key=${INDEXNOW_KEY}`,
    );
  });

  test("never throws, whatever the search engines say", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(null, { status: 429 }));
    await expect(notifyIndexNow("https://mikecann.blog/posts/a")).resolves.toBeUndefined();
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("offline"));
    await expect(notifyIndexNow("https://mikecann.blog/posts/a")).resolves.toBeUndefined();
  });
});
