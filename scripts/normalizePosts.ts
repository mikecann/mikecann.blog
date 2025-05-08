import fs, { writeFileSync } from "fs";
import { join } from "path";
import matter from "gray-matter";
import { promisify } from "util";
import fetch from "node-fetch";
import { pipeline } from "stream";
import imageSize from "image-size";
import { getPostCoverImageAbsolutePath } from "./posts";
import { producePostMeta } from "./posts/PostMeta";

const streamPipeline = promisify(pipeline);

const fallbackImage = `/images/fallback-post-header.png`;

const postsDirectory = join(process.cwd(), "public/posts");

const moveMDToOwnDirs = () => {
  for (let filename of fs.readdirSync(postsDirectory)) {
    const filePath = join(postsDirectory, filename);
    const stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) continue;

    const slug = filename.replace(/\.md$/, "");

    const dirPath = join(postsDirectory, slug);
    fs.mkdirSync(dirPath);

    fs.copyFileSync(filePath, join(dirPath, "post.md"));

    fs.unlinkSync(filePath);
  }
};

const renameMDsInOwnDir = () => {
  const renameMDToPostInDir = (dirPath: string) => {
    for (let filename of fs.readdirSync(dirPath)) {
      if (!filename.endsWith("md")) continue;
      fs.renameSync(join(dirPath, filename), join(dirPath, "post.md"));
    }
  };

  for (let filename of fs.readdirSync(postsDirectory)) {
    const filePath = join(postsDirectory, filename);
    const stats = fs.lstatSync(filePath);
    if (!stats.isDirectory()) continue;

    renameMDToPostInDir(filePath);
  }
};

const normalizeMetadata = async () => {
  for (let filename of fs.readdirSync(postsDirectory)) {
    const postDir = join(postsDirectory, filename);
    const absPostPath = join(postDir, `post.md`);
    const fileContents = fs.readFileSync(absPostPath, "utf8");

    const { data, content } = matter(fileContents);

    const date =
      data.date instanceof Date
        ? (data.date as Date).toISOString()
        : new Date(data.date).toISOString();

    let coverImage: string = data.coverImage || data.featuredImage || fallbackImage;

    if (coverImage.startsWith("/public/posts/"))
      coverImage = coverImage.replace("/public/posts/", "/posts/");

    if (coverImage.startsWith("http")) {
      console.log(`downloading '${coverImage}'...`);
      const response = await fetch(coverImage);
      if (!response.ok) throw new Error(`unexpected response ${response.statusText}`);
      if (!response.body) throw new Error(`response.body is null`);
      await streamPipeline(response.body, fs.createWriteStream(join(postDir, `cover.jpg`)));
      coverImage = `/public/posts/${filename}/cover.jpg`;
    }

    try {
      const imagePath = getPostCoverImageAbsolutePath(postDir, coverImage);
      const imageBuffer = fs.readFileSync(imagePath);
      imageSize(new Uint8Array(imageBuffer));
    } catch (e) {
      console.log(`corrupt image, replacing with fallback`);
      coverImage = fallbackImage;
    }

    const postMeta = producePostMeta({
      coverImage,
      date,
      tags: [...data.tags].map((s: string) => s.toLowerCase()),
      title: data.title,
    });

    fs.writeFileSync(absPostPath, matter.stringify(content, postMeta));
  }
};

async function bootstrap() {
  moveMDToOwnDirs();
  renameMDsInOwnDir();
  await normalizeMetadata();
}

bootstrap();
