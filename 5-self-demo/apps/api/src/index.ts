import { Hono } from "hono";
import { streamSSE } from "hono/streaming";


// define routes and export app
export const app = new Hono();

// Health
app.get("/api/health", (c) => c.json({ ok: true }));

// 1) SSE endpoint
app.get("/api/sse", (c) => {
  c.header("Content-Type", "text/event-stream");
  c.header("Cache-Control", "no-cache");
  c.header("Connection", "keep-alive");

  let id = 0;

  return streamSSE(c, async (stream) => {
    while (true) {
      const payload = { ts: new Date().toISOString(), n: id };
      await stream.writeSSE({
        event: "tick",
        id: String(id++),
        data: JSON.stringify(payload),
      });
      await stream.sleep(1000);
    }
  });
});

// 2) Remote content endpoint (Content Layer loader will fetch this)
app.get("/api/content/high-level", (c) => {
  const docs = [
    {
      id: "remote-1",
      title: "Remote MDX: Live Island Demo",
      summary: "This MDX came from the Hono backend and embeds a Svelte island.",
      updatedAt: new Date().toISOString(),
      bodyMdx: `
import RealtimeIsland from "@components/RealtimeIsland.svelte";

# Remote Content (from Hono)

This page proves an island works **inside remote MDX**:

<RealtimeIsland client:load />

More text after the island.
`.trim(),
    },
  ];

  return c.json(docs);
});
