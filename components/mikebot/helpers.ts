import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex/react";

export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

/** The JSON shape the server stores for a visitor's message (see createUserPrompt). */
export type UserMessageJSON = {
  context: {
    currentUrl: string;
  };
  message: string;
};

export const parseUserMessageJSON = (message: string): UserMessageJSON => {
  return JSON.parse(message);
};
