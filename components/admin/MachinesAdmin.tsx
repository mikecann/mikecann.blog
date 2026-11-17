import { useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { ConvexReactClient } from "convex/react";
import { MachinesViewer } from "@convex-dev/state-machines/viewer";
import "@convex-dev/state-machines/viewer.css";
import { api } from "../../convex/_generated/api";
import { CONVEX_SITE_URL, CONVEX_URL } from "../../utils/convex";

// The admin Machines page (/admin/machines): every state machine the blog runs, drawn from its
// rules, with the rows in each state and their history, through the state machines library's own
// viewer. It reads through convex/viewer.ts, which answers only the signed-in admin and can't move
// anything.
//
// Signing in trades the admin token (BLOG_POST_ADMIN_TOKEN) for an hour's admin JWT at the
// deployment's /admin/session (convex/admin/session.ts). The token stays in this page's memory, so
// the Convex client can get a fresh JWT when the old one runs out, and is gone when the tab closes.
// A password manager can fill it in.

type Session = { token: string; expiresAt: number };

const requestSession = async (adminToken: string): Promise<Session> => {
  const response = await fetch(`${CONVEX_SITE_URL}/admin/session`, {
    method: "POST",
    // text/plain, so the browser skips the CORS preflight
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ token: adminToken }),
  });
  const body = (await response.json().catch(() => ({}))) as Partial<Session> & { error?: string };
  if (!response.ok || !body.token || !body.expiresAt)
    throw new Error(body.error ?? `Signing in failed (HTTP ${response.status}).`);
  return { token: body.token, expiresAt: body.expiresAt };
};

/** A Convex client signed in as the admin, renewing its JWT a minute before it runs out. */
const signedInClient = (adminToken: string, first: Session) => {
  let session = first;
  const client = new ConvexReactClient(CONVEX_URL);
  client.setAuth(async ({ forceRefreshToken }) => {
    if (forceRefreshToken || Date.now() > session.expiresAt - 60_000)
      session = await requestSession(adminToken).catch(() => session);
    return session.token;
  });
  return client;
};

export default function MachinesAdmin() {
  const [client, setClient] = useState<ConvexReactClient | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tokenInput = useRef<HTMLInputElement>(null);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    const adminToken = tokenInput.current?.value.trim() ?? "";
    if (!adminToken || signingIn) return;
    setSigningIn(true);
    setError(null);
    try {
      setClient(signedInClient(adminToken, await requestSession(adminToken)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSigningIn(false);
    }
  };

  const signOut = () => {
    void client?.close();
    setClient(null);
  };

  const functions = useMemo(() => api.viewer, []);

  if (!client)
    return (
      <form onSubmit={signIn} style={styles.form}>
        <h1 style={{ margin: 0 }}>Machines</h1>
        <p style={{ margin: 0 }}>The blog's state machines, live. Sign in with the admin token.</p>
        {/* The username is for password managers, so they save the token as this site's admin */}
        <input type="text" name="username" value="admin" autoComplete="username" readOnly hidden />
        <input
          ref={tokenInput}
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="BLOG_POST_ADMIN_TOKEN"
          aria-label="Admin token"
          disabled={signingIn}
          style={styles.input}
          autoFocus
        />
        <button type="submit" disabled={signingIn} style={styles.button}>
          {signingIn ? "Signing in…" : "Sign in"}
        </button>
        {error && (
          <p role="alert" style={{ margin: 0, color: "#b42318" }}>
            {error}
          </p>
        )}
      </form>
    );

  return (
    <div style={{ "--mv-top": "0px" } as CSSProperties}>
      <div style={styles.bar}>
        <a href="/">mikecann.blog</a>
        <button type="button" onClick={signOut} style={styles.signOut}>
          Sign out
        </button>
      </div>
      <MachinesViewer
        client={client}
        functions={functions}
        config={{
          settings: { theme: "light" },
          tables: { postEmailCampaigns: { name: "Post emails", label: "slug" } },
        }}
      />
    </div>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 420,
    margin: "80px auto",
    padding: 20,
    fontFamily: "system-ui, sans-serif",
  },
  input: { padding: "10px 12px", fontSize: 16, border: "1px solid #ccc", borderRadius: 6 },
  button: {
    padding: "10px 12px",
    fontSize: 16,
    border: "none",
    borderRadius: 6,
    background: "#222",
    color: "white",
    cursor: "pointer",
  },
  bar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 16px",
    fontFamily: "system-ui, sans-serif",
    fontSize: 14,
  },
  signOut: { background: "none", border: "1px solid #ccc", borderRadius: 6, padding: "4px 10px" },
} satisfies Record<string, CSSProperties>;
