import dotenv from "dotenv";
import OpenAI from "openai";
import matter from "gray-matter";
import { PostWithContent, getAllPublishablePosts } from "../posts";
import { createReadStream, writeFileSync } from "fs";
import fs from "fs";
import path from "path";

// Load environment variables from .env file
dotenv.config({
  path: `.env`,
});

async function bootstrap() {
  // Check for required environment variables
  const openAIKey = process.env.OPEN_AI_API_KEY;
  if (!openAIKey)
    throw new Error(
      `Missing env OPEN_AI_API_KEY, have you defined a .env file in the root of the project?`,
    );

  const vectorStoreId = process.env.OPENAI_POSTS_VECTOR_STORE_ID;
  if (!vectorStoreId)
    throw new Error(
      `Missing env OPENAI_POSTS_VECTOR_STORE_ID, have you defined a .env file in the root of the project?`,
    );

  // Initialize OpenAI client
  const openai = new OpenAI({
    apiKey: openAIKey,
  });

  // Get all posts and filter out those that have already been uploaded
  const allPosts = getAllPublishablePosts();
  const postsToUpload = allPosts.filter((post) => !post.meta.openAIMikesBlogFileId);

  console.log(`starting..`, {
    totalPosts: allPosts.length,
    postsToUpload: postsToUpload.length,
  });

  // Create temporary directory for file operations
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

  // Function to handle individual post upload
  const handle = async (post: PostWithContent) => {
    const postDir = path.dirname(post.absPostPath);
    const tempFileName = path.join(tmpDir, path.basename(postDir) + ".md");

    // Copy post to temporary file
    fs.copyFileSync(post.absPostPath, tempFileName);

    console.log(`uploading..`, tempFileName);

    // Upload file to OpenAI vector store
    const result = await openai.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, {
      files: [createReadStream(tempFileName)],
    });

    if (result.status == "completed") {
      console.log(`Upload completed, Adding id '${result.id}' back into the post`);
      // Update post metadata with vector store file ID
      fs.writeFileSync(
        post.absPostPath,
        matter.stringify(post.content, {
          ...post.meta,
          openAIMikesBlogFileId: result.id,
        }),
      );
    } else console.log(`Error uploading post`, result);

    // Clean up temporary file
    fs.unlinkSync(tempFileName);
  };

  // Limit the number of posts to upload (for testing or batching)
  const somePosts = postsToUpload; //.slice(0, 10);

  // Process posts
  try {
    for (let post of somePosts) await handle(post);
  } catch (e) {
    console.error(e);
  }

  // Clean up temporary directory
  fs.rmdirSync(tmpDir);

  process.exit(0);
}

bootstrap();
