import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";
import rag from "@convex-dev/rag/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";
import stateMachines from "@convex-dev/state-machines/convex.config.js";

const app = defineApp();
app.use(agent);
app.use(rag);
app.use(rateLimiter);
app.use(stateMachines);

export default app;
