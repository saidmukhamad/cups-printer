import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { api } from "./routes.ts";

const app = new Hono();

app.route("/api", api);

// In production, serve the built frontend
app.use("/*", serveStatic({ root: "./dist" }));
app.use("/*", serveStatic({ root: "./dist", path: "index.html" }));

const port = parseInt(process.env["PORT"] || "3000", 10);

Bun.serve({
  port,
  hostname: "0.0.0.0",
  fetch: app.fetch,
});

console.log(`Server running on http://0.0.0.0:${port}`);
