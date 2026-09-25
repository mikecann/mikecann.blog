import * as React from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getMikebotErrorMessage } from "../../convex/mikebot/shared";
import { useQueryWithStatus } from "./helpers";
import { readStorage, removeStorage, storageKeys, writeStorage } from "./storage";

/**
 * Finds the visitor's current thread (remembered in localStorage), creating a
 * new one when there is none or it no longer exists / isn't theirs.
 */
export const useMikebotThread = (token: string | null) => {
  const [storedThreadId, setStoredThreadId] = React.useState<string | null>(() =>
    readStorage(storageKeys.currentThreadId),
  );
  const [error, setError] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const isCreatingRef = React.useRef(false);

  const createThread = useMutation(api.mikebot.mutations.createThreadForUser);
  const deleteThreadMutation = useMutation(api.mikebot.mutations.deleteThreadForUser);

  const threadQuery = useQueryWithStatus(
    api.mikebot.queries.findThreadForUser,
    token && storedThreadId ? { token, threadId: storedThreadId } : "skip",
  );

  const forgetThread = React.useCallback(() => {
    removeStorage(storageKeys.currentThreadId);
    setStoredThreadId(null);
  }, []);

  React.useEffect(() => {
    if (!token || error) return;

    if (storedThreadId) {
      if (threadQuery.status !== "success" || threadQuery.data) return;
      // The thread was deleted or belongs to an old identity: start afresh.
      forgetThread();
      return;
    }

    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
    createThread({ token })
      .then((threadId) => {
        writeStorage(storageKeys.currentThreadId, threadId);
        setStoredThreadId(threadId);
      })
      .catch((e) => setError(getMikebotErrorMessage(e)))
      .finally(() => {
        isCreatingRef.current = false;
      });
  }, [
    token,
    error,
    storedThreadId,
    threadQuery.status,
    threadQuery.data,
    createThread,
    forgetThread,
  ]);

  const threadId = storedThreadId && threadQuery.data ? threadQuery.data._id : null;

  /** Deletes the current thread on the server; a new one is then created. */
  const deleteThread = async () => {
    if (!token || !threadId) return;
    setIsDeleting(true);
    try {
      await deleteThreadMutation({ token, threadId });
      forgetThread();
    } catch (e) {
      setError(getMikebotErrorMessage(e));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    threadId,
    error,
    clearError: () => setError(null),
    deleteThread,
    isDeleting,
  };
};
