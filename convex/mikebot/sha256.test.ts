import { describe, expect, test } from "vitest";
import { sha256Hex } from "./sha256";

const subtleSha256Hex = async (message: string) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(message));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
};

describe("sha256Hex", () => {
  test.each([
    ["", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"],
    ["abc", "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"],
    [
      "abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq",
      "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1",
    ],
  ])("matches the FIPS 180-4 test vector for %j", (input, expected) => {
    expect(sha256Hex(input)).toBe(expected);
  });

  test("matches Web Crypto across padding boundaries and multi-byte characters", async () => {
    const inputs = [
      ...Array.from({ length: 130 }, (_, i) => "x".repeat(i)),
      "émojis 🚀 and ñ",
      "a".repeat(1000),
    ];
    for (const input of inputs) expect(sha256Hex(input)).toBe(await subtleSha256Hex(input));
  });
});
