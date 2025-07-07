import crypto from "crypto";

export function hashContent(content: string): string {
  // Normalize line endings to ensure consistent hashes across different OS
  const normalizedContent = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  return crypto.createHash("sha256").update(normalizedContent).digest("hex");
}
