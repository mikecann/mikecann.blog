// import puppeteer from "puppeteer";
// import { Converter } from "showdown";
// import dotenv from "dotenv";
// import OpenAI from "openai";
// import fs from "fs";
// import { writeFileSync } from "fs";
// import matter from "gray-matter";
// import { PostWithContent, getAllPublishablePosts } from "../posts";

// dotenv.config({
//   path: `.env`,
// });

// const openAIKey = process.env.OPEN_AI_API_KEY;
// if (!openAIKey)
//   throw new Error(
//     `Missing env OPEN_AI_API_KEY, have you defined a .env file in the root of the project?`
//   );

// async function bootstrap() {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   const converter = new Converter();
//   const openai = new OpenAI({
//     apiKey: openAIKey,
//   });

//   const allPosts = getAllPublishablePosts();
//   const postsWithNoTags = allPosts.filter((p) => p.meta.tags.length == 0);

//   console.log(`starting..`, {
//     totalPosts: allPosts.length,
//     postsWithNoTags: postsWithNoTags.length,
//   });

//   // We want to record any failures for later analysis
//   const results: { title: string; prompt: string; tags: string[] }[] = [];

//   // For each post
//   const handle = async (post: PostWithContent) => {
//     console.log(`Extracting text from post '${post.meta.title}'..`);

//     const html = converter.makeHtml(post.content);

//     await page.setContent(`<html><body>${html}</html>`);

//     const el = await page.$(`body`);
//     const text = await el!.evaluate((el) => el.textContent);

//     let trimmedText = text!.trim().substr(0, 1900);
//     if (trimmedText[trimmedText.length - 1] == ":")
//       trimmedText = trimmedText.substr(0, trimmedText.length - 1);

//     const prompt = `Blog Post: ${trimmedText}\n\nKeywords: `;

//     console.log(`Sending ${prompt.length} chars to OpenAI..`);

//     //   const gptResponse = await openai.complete({
//     //     engine: "davinci",
//     //     prompt,
//     //     maxTokens: 60,
//     //     temperature: 0.3,
//     //     topP: 1,
//     //     presencePenalty: 0,
//     //     frequencyPenalty: 0,
//     //     bestOf: 1,
//     //     n: 1,
//     //     stream: false,
//     //     stop: ["\n"],
//     //   });

//     //   const responseText = gptResponse.data.choices[0]?.text ?? "";
//     //   console.log(`OpenAI returned the keywords: ${responseText}`);

//     //   const tags = responseText.split(`, `).slice(5);

//     //   results.push({ title: post.meta.title, prompt, tags });

//     //   if (tags.length > 0) {
//     //     console.log(`Adding ${tags.length} tags back into the post`);
//     //     fs.writeFileSync(
//     //       post.absPostPath,
//     //       matter.stringify(post.content, {
//     //         ...post.meta,
//     //         tags,
//     //       })
//     //     );
//     //   } else console.log(`The prompt that it struggled on was:\n\n---\n${prompt}\n---\n\n`);
//   };

//   // // Iterate all the posts
//   // try {
//   //   for (let post of postsWithNoTags) {
//   //     console.log(``);
//   //     await handle(post);
//   //   }
//   // } catch (e) {
//   //   console.error(e);
//   // }

//   // // Always write out the failures to a file
//   // fs.writeFileSync(`./open-ai-keywords-results-log.json`, JSON.stringify(results, null, 2));

//   // // And close
//   // await page.close();
//   // process.exit(0);
// }

// bootstrap();
