import { v } from "convex/values";
import { internalAction } from "../../_generated/server";
import { Resend } from "resend";
import { ensure } from "../../../essentials/misc/ensure";
import { components } from "../../_generated/api";
import { sumNumbers } from "../../../essentials/misc/array";
import { mikebot } from "../lib";

export const streamStory = internalAction({
  args: { promptMessageId: v.string(), threadId: v.string() },
  handler: async (ctx, { promptMessageId, threadId }) => {
    // Generate the embeddings for the message from the user, this shouldnt be
    // needed in the future
    await mikebot.generateAndSaveEmbeddings(ctx, {
      messageIds: [promptMessageId],
    });

    // Start streaming the reponse by line into the database
    const result = await mikebot.streamText(
      ctx,
      { threadId },
      { promptMessageId },
      {
        saveStreamDeltas: {
          chunking: "line",
        },
      },
    );

    await result.consumeStream();
  },
});

export const sendThreadUpdatedNotification = internalAction({
  args: {
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    const resend = new Resend(ensure(process.env.RESEND_API_KEY, "RESEND_API_KEY is not set"));

    const result = await ctx.runQuery(components.agent.messages.listMessagesByThreadId, {
      threadId: args.threadId,
      order: "asc",
      statuses: ["failed", "pending", "success"],
      paginationOpts: {
        cursor: null,
        numItems: 100,
      },
    });

    const messages = result.page;
    const completionTokens = sumNumbers(messages.map((m) => m.usage?.completionTokens ?? 0));
    const promptTokens = sumNumbers(messages.map((m) => m.usage?.promptTokens ?? 0));
    const totalTokensUsed = completionTokens + promptTokens;

    const inputTokenCost = (promptTokens / 1_000_000) * 0.15;
    const outputTokenCost = (completionTokens / 1_000_000) * 0.6;
    const totalCost = inputTokenCost + outputTokenCost;

    const messageHtml = messages
      .map(
        (message) => `
      <div style="margin-bottom: 10px; padding: 10px; border-radius: 5px; background-color: ${
        message.message?.role === "assistant" ? "#f0f0f0" : "#e6f2ff"
      };">
        <strong>${message.message?.role === "assistant" ? "Assistant" : "User"}:</strong>
        <p>${message.text}</p>
      </div>
    `,
      )
      .join("");

    const html = `
      <h1>Mikebot Thread Updated</h1>
      <h2>Thread Summary</h2>
      <p>Total messages: ${messages.length}</p>
      <p>Tokens used: ${totalTokensUsed}</p>
      <ul>
        <li>Input tokens: ${promptTokens} (Cost: $${inputTokenCost.toFixed(6)})</li>
        <li>Output tokens: ${completionTokens} (Cost: $${outputTokenCost.toFixed(6)})</li>
      </ul>
      <p>Total estimated cost: $${totalCost.toFixed(6)}</p>
      <h2>Messages</h2>
      ${messageHtml}
    `;

    console.log("sending email..", html);

    await resend.emails.send({
      from: "admin@mikecann.blog",
      to: "mike.cann@gmail.com",
      subject: "Mikebot Thread Updated",
      html,
    });

    return "sent";
  },
});
