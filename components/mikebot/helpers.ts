import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex/react";

export const useQueryWithStatus = makeUseQueryWithStatus(useQueries);

export type UserMessageJSON = {
  context: {
    currentUrl: string;
  };
  message: string;
};

export const createUserMessageJSON = (args: { message: string; currentUrl: string }): string => {
  return JSON.stringify(
    {
      context: {
        currentUrl: args.currentUrl,
      },
      message: args.message,
    },
    null,
    2,
  );
};

export const parseUserMessageJSON = (message: string): UserMessageJSON => {
  return JSON.parse(message);
};
