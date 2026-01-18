import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";

const app = new Hono();

app.use("/*", logger());

app.get("/api", (c) => {
  return c.text("Hello new path!");
});

export default app;