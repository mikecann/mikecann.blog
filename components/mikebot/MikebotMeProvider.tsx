"use client";
import { useMutation } from "convex/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { getMikebotErrorMessage, MIKEBOT_TOKEN_PATTERN } from "../../convex/mikebot/shared";
import { readStorage, removeStorage, storageKeys, writeStorage } from "./storage";

interface Props {
  children: React.ReactNode;
}

export type MikebotMe =
  | { status: "loading" }
  | { status: "ready"; token: string }
  | { status: "error"; message: string; retry: () => void };

/** 32 random bytes as hex: the only credential for this anonymous visitor. */
const generateToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

const readOrCreateToken = (): string => {
  const existing = readStorage(storageKeys.token);
  if (existing && MIKEBOT_TOKEN_PATTERN.test(existing)) return existing;

  // New identity. Visitors from before token-based identity lose their old
  // (anonymous) chat history, so forget their stale ids too.
  const token = generateToken();
  writeStorage(storageKeys.token, token);
  for (const key of storageKeys.legacy) removeStorage(key);
  return token;
};

export const MikebotMeProvider: React.FC<Props> = ({ children }) => {
  const [token] = useState(readOrCreateToken);
  const [attempt, setAttempt] = useState(0);
  const [me, setMe] = useState<MikebotMe>({ status: "loading" });
  const ensureAnonymousUser = useMutation(api.users.ensureAnonymousUser);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  useEffect(() => {
    let cancelled = false;
    setMe({ status: "loading" });
    ensureAnonymousUser({ token })
      .then(() => {
        if (!cancelled) setMe({ status: "ready", token });
      })
      .catch((error) => {
        if (!cancelled) setMe({ status: "error", message: getMikebotErrorMessage(error), retry });
      });
    return () => {
      cancelled = true;
    };
  }, [token, attempt, ensureAnonymousUser, retry]);

  return <MikebotMeContext.Provider value={me}>{children}</MikebotMeContext.Provider>;
};

export const MikebotMeContext = createContext<MikebotMe>({ status: "loading" });

export const useMe = () => useContext(MikebotMeContext);
