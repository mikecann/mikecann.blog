import { useState, type CSSProperties, type ReactNode } from "react";
import { ConvexReactClient, useConvexAuth, useQuery } from "convex/react";
import { ConvexAuthProvider, useAuthActions } from "@convex-dev/auth/react";
import { useOauth, useSignInWithGoogle } from "@convex-dev/auth/methods/google/react";
import { MachinesViewer } from "@convex-dev/state-machines/viewer";
import "@convex-dev/state-machines/viewer.css";
import { api } from "../../convex/_generated/api";
import { CONVEX_URL } from "../../utils/convex";

// The admin Machines page (/admin/machines): sign in with Google, then, for the blog's admins
// only, the state machines library's own viewer on the deployment's live data: every machine
// drawn from its rules, the rows in each state and their history. convex/viewer.ts decides who's
// an admin (convex/admin/auth.ts) and answers null to everyone else, so nothing here is the gate;
// it only shows the answer. Read-only: nothing on the page can move a row.

const PAGE = "/admin/machines";

let client: ConvexReactClient | undefined;
const getClient = () => (client ??= new ConvexReactClient(CONVEX_URL));

function Spinner() {
  return <span style={styles.spinner} aria-hidden="true" />;
}

function Card({ children }: { children: ReactNode }) {
  return (
    <main style={styles.screen}>
      <div style={styles.card}>{children}</div>
    </main>
  );
}

function SignIn() {
  const { signIn } = useSignInWithGoogle(api.admin.auth);
  const { flowError } = useOauth();
  // Spins, and stays off, until the page leaves for Google, or comes back if starting failed
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const start = async () => {
    setPending(true);
    setFailed(false);
    // Back to this page, keeping the viewer's place (its #/ route)
    const redirectTo = `${window.location.origin}${PAGE}${window.location.hash}`;
    const result = await signIn({ redirectTo });
    if (result.status === "error") {
      setPending(false);
      setFailed(true);
    }
  };

  const problem = failed || (flowError !== null && flowError.error !== "ACCESS_DENIED");
  return (
    <Card>
      <h1 style={{ margin: 0 }}>Machines</h1>
      <p style={{ margin: 0 }}>The blog's state machines, live, for its admin.</p>
      <button type="button" style={styles.button} disabled={pending} onClick={() => void start()}>
        {pending ? <Spinner /> : <GoogleLogo />}
        Continue with Google
      </button>
      {problem && (
        <p role="alert" style={styles.problem}>
          That didn't work, or that Google account isn't one of the blog's admins.
        </p>
      )}
    </Card>
  );
}

function SignOutButton() {
  const { signOut } = useAuthActions();
  const [pending, setPending] = useState(false);
  return (
    <button
      type="button"
      style={styles.quiet}
      disabled={pending}
      onClick={() => {
        setPending(true);
        // Signed out, the page swaps to the sign-in; if it fails, the button comes back
        void signOut().catch(() => setPending(false));
      }}
    >
      {pending && <Spinner />}
      Sign out
    </button>
  );
}

function Admin() {
  const me = useQuery(api.viewer.me, {});
  // The same query the viewer opens first, so it's one subscription: null means not an admin
  const overview = useQuery(api.viewer.overview, {});
  if (me === undefined || overview === undefined) return <Loading />;
  if (me === null || overview === null)
    return (
      <Card>
        <h1 style={{ margin: 0 }}>Not an admin</h1>
        <p style={{ margin: 0 }}>That Google account can't see the blog's machines.</p>
        <SignOutButton />
      </Card>
    );
  return (
    // The viewer fills the window under the bar, so its background doesn't stop where its
    // content does (styles in MachinesAdmin below)
    <div className="blog-admin" style={{ "--mv-top": "0px" } as CSSProperties}>
      <header style={styles.bar}>
        <a href="/">mikecann.blog</a>
        <span style={{ marginLeft: "auto" }}>{me.email}</span>
        <SignOutButton />
      </header>
      <MachinesViewer
        functions={api.viewer}
        config={{
          settings: { theme: "light" },
          tables: { postEmailCampaigns: { name: "Post emails", label: "slug" } },
        }}
      />
    </div>
  );
}

function Loading() {
  return (
    <main style={styles.screen}>
      <Spinner />
    </main>
  );
}

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading) return <Loading />;
  return isAuthenticated ? <Admin /> : <SignIn />;
}

export default function MachinesAdmin() {
  return (
    <ConvexAuthProvider
      client={getClient()}
      api={{ refreshSession: api.admin.auth.refreshSession, signOut: api.admin.auth.signOut }}
    >
      <style>
        {"@keyframes admin-spin { to { transform: rotate(360deg) } }" +
          ".blog-admin { display: flex; flex-direction: column; min-height: 100dvh }" +
          ".blog-admin > .mv { flex: 1 }"}
      </style>
      <App />
    </ConvexAuthProvider>
  );
}

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.45a5.5 5.5 0 0 1-2.4 3.62v3h3.88c2.27-2.1 3.57-5.18 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76l4.01-3.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.59 1.8l3.44-3.44A11.97 11.97 0 0 0 1.27 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

const styles = {
  screen: {
    display: "flex",
    justifyContent: "center",
    padding: "80px 20px",
    fontFamily: "system-ui, sans-serif",
  },
  card: { display: "flex", flexDirection: "column", gap: 14, width: "100%", maxWidth: 380 },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "10px 12px",
    fontSize: 16,
    border: "1px solid #ccc",
    borderRadius: 6,
    background: "white",
    cursor: "pointer",
  },
  quiet: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: "4px 10px",
    cursor: "pointer",
  },
  problem: { margin: 0, color: "#b42318" },
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 16px",
    fontFamily: "system-ui, sans-serif",
    fontSize: 14,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid #ccc",
    borderTopColor: "#333",
    borderRadius: "50%",
    animation: "admin-spin 0.8s linear infinite",
    display: "inline-block",
  },
} satisfies Record<string, CSSProperties>;
