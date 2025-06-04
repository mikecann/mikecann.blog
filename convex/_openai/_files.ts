// import { internalAction } from "../_generated/server";
// import OpenAI from "openai";
// import { ensure } from "../../essentials/misc/ensure";
// import { PageId } from "../schema";

// export const knownFiles = {
//   pages: {
//     about: "file-NQ33YPlykfxMZizEp13t3U8a",
//   } satisfies Record<PageId, string>,
// };

// export const findKnownPageIdFromFileId = (fileId: string): PageId | null => {
//   const pageId = Object.entries(knownFiles.pages).find(([_, id]) => id === fileId);
//   return pageId ? pageId[0] as PageId : null;
// };

// export const queryFile = internalAction({
//   args: {},
//   handler: async ({ runQuery }) => {
//     const openai = new OpenAI({
//       apiKey: ensure(
//         process.env.OPEN_AI_API_KEY,
//         `Missing env OPEN_AI_API_KEY, have you added it to the Convex environment?`
//       ),
//     });

//     const file = await openai.files.retrieve("file-NQ33YPlykfxMZizEp13t3U8a");

//     console.log(file);
//   },
// });
