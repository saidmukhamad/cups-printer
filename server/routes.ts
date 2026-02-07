import { Hono } from "hono";
import { getPrinters, getJobs, printFile, cancelJob } from "./cups.ts";
import { join } from "path";
import { mkdirSync, existsSync, unlinkSync } from "fs";

const UPLOAD_DIR = join(import.meta.dirname, "..", "uploads");

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const api = new Hono();

api.get("/printers", async (c) => {
  const printers = await getPrinters();
  return c.json(printers);
});

api.get("/jobs", async (c) => {
  const jobs = await getJobs();
  return c.json(jobs);
});

api.post("/print", async (c) => {
  const body = await c.req.parseBody();
  const file = body["file"];
  const printer = body["printer"] as string;
  const copies = parseInt((body["copies"] as string) || "1", 10);

  if (!file || !(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }
  if (!printer) {
    return c.json({ error: "No printer specified" }, 400);
  }

  const filename = `${crypto.randomUUID()}-${file.name}`;
  const filepath = join(UPLOAD_DIR, filename);

  await Bun.write(filepath, file);

  try {
    const jobId = await printFile(filepath, printer, copies);
    // Clean up after 5 minutes
    setTimeout(() => {
      try {
        unlinkSync(filepath);
      } catch {}
    }, 5 * 60 * 1000);

    return c.json({ jobId, message: `Print job submitted: ${jobId}` });
  } catch (err: unknown) {
    // Clean up on error
    try {
      unlinkSync(filepath);
    } catch {}
    const message = err instanceof Error ? err.message : "Print failed";
    return c.json({ error: message }, 500);
  }
});

api.delete("/jobs/:id", async (c) => {
  const jobId = c.req.param("id");
  try {
    await cancelJob(jobId);
    return c.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Cancel failed";
    return c.json({ error: message }, 500);
  }
});
