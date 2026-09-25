import fs from "fs";
import { extname, join } from "path";

export type ImageFormat = "jpeg" | "png" | "gif" | "webp" | "bmp" | "ico" | "svg" | "avif";

/** The format a browser expects for each image file extension we serve. */
export const IMAGE_EXTENSIONS: Record<string, ImageFormat> = {
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".png": "png",
  ".gif": "gif",
  ".webp": "webp",
  ".bmp": "bmp",
  ".ico": "ico",
  ".svg": "svg",
  ".avif": "avif",
};

export const getExpectedImageFormat = (path: string): ImageFormat | undefined =>
  IMAGE_EXTENSIONS[extname(path).toLowerCase()];

const startsWith = (buf: Uint8Array, bytes: number[], offset = 0) =>
  buf.length >= offset + bytes.length && bytes.every((b, i) => buf[offset + i] === b);

const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

/** Sniffs the real image format from a file's leading bytes (undefined if it isn't an image). */
export const detectImageFormat = (buf: Uint8Array): ImageFormat | undefined => {
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return "jpeg";
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (startsWith(buf, ascii("GIF87a")) || startsWith(buf, ascii("GIF89a"))) return "gif";
  if (startsWith(buf, ascii("RIFF")) && startsWith(buf, ascii("WEBP"), 8)) return "webp";
  if (startsWith(buf, ascii("ftypavif"), 4) || startsWith(buf, ascii("ftypavis"), 4)) return "avif";
  if (startsWith(buf, [0x42, 0x4d])) return "bmp";
  if (startsWith(buf, [0x00, 0x00, 0x01, 0x00])) return "ico";
  const text = new TextDecoder().decode(buf.subarray(0, 1024)).replace(/^﻿/, "").trimStart();
  if (text.startsWith("<svg") || (text.startsWith("<?xml") && text.includes("<svg"))) return "svg";
  return undefined;
};

export const detectImageFormatOfFile = (path: string): ImageFormat | undefined => {
  const fd = fs.openSync(path, "r");
  try {
    const buf = Buffer.alloc(1024);
    const bytesRead = fs.readSync(fd, buf, 0, buf.length, 0);
    return detectImageFormat(buf.subarray(0, bytesRead));
  } finally {
    fs.closeSync(fd);
  }
};

/** Recursively lists files under a directory (or returns the path itself if it's a file). */
export const listFiles = (path: string): string[] => {
  const stat = fs.statSync(path);
  if (stat.isFile()) return [path];
  return fs
    .readdirSync(path, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile())
    .map((e) => join(e.parentPath, e.name));
};
