// localStorage can be unavailable (private mode, blocked storage) and throw on
// access, so every read and write goes through these helpers.

export const storageKeys = {
  /** The visitor's secret anonymous-identity token. */
  token: "mikebot_token",
  /** The thread the visitor is currently chatting in. */
  currentThreadId: "mikebot_current_thread_id",
  /** Keys from before token-based identity; cleared when a new token is created. */
  legacy: ["mikebot_me_userId", "mikebot2_current_thread_id"],
} as const;

export const readStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Not persisted: the visitor just gets a fresh identity / thread next visit.
  }
};

export const removeStorage = (key: string) => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};
