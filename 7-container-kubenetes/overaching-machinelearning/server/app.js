import { Hono } from "@hono/hono";
import postgres from "postgres";
import { Redis } from "ioredis";
import { auth } from "./auth.js";

const app = new Hono();
const sql = postgres(Deno.env.get("DATABASE_URL"));

const cache = new Map();
const QUEUE_NAME = "submissions";

/**
 * Authentication Middleware
 * Checks for a valid session and returns 401 if unauthorized.
 */
const authMiddleware = async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.text("Unauthorized", 401);
  }

  c.set("user", session.user);
  await next();
};

app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

let redis;
if (Deno.env.get("REDIS_HOST")) {
  redis = new Redis(
    Number.parseInt(Deno.env.get("REDIS_PORT")),
    Deno.env.get("REDIS_HOST"),
  );
} else {
  redis = new Redis(6379, "redis");
}

app.get("/api/languages", async (c) => {
  const cacheKey = "languages";

  if (cache.has(cacheKey)) {
    return c.json(cache.get(cacheKey));
  }

  const languages = await sql`SELECT id, name FROM languages`;
  cache.set(cacheKey, languages);

  return c.json(languages);
});

app.get("/api/languages/:id/exercises", async (c) => {
  const id = c.req.param("id");
  const cacheKey = `exercises_${id}`;

  if (cache.has(cacheKey)) {
    return c.json(cache.get(cacheKey));
  }

  const exercises = await sql`
    SELECT id, title, description
    FROM exercises
    WHERE language_id = ${id}
  `;

  cache.set(cacheKey, exercises);

  return c.json(exercises);
});

app.get("/api/exercises/:id", async (c) => {
  const id = c.req.param("id");

  const [exercise] = await sql`
    SELECT id, title, description
    FROM exercises
    WHERE id = ${id}
  `;

  if (!exercise) {
    return c.body(null, 404);
  }

  return c.json(exercise);
});

app.post("/api/exercises/:id/submissions", authMiddleware, async (c) => {
  try {
    const exerciseId = c.req.param("id");
    const { source_code } = await c.req.json();
    const user = c.get("user");

    const [submission] = await sql`
      INSERT INTO exercise_submissions (exercise_id, source_code, user_id)
      VALUES (${exerciseId}, ${source_code}, ${user.id})
      RETURNING id
    `;

    await redis.rpush(QUEUE_NAME, submission.id);
    return c.json({ id: submission.id });
  } catch (err) {
    console.error("Error ", err);
    return c.text("Internal Server Error", 500);
  }
});

/**
 * GET /api/submissions/:id/status
 * Retrieves status for a submission only for the authenticated user.
 * Returns 404 with empty body if not found or not owned by the user.
 * Returns 401 for unauthenticated users.
 */
app.get("/api/submissions/:id/status", authMiddleware, async (c) => {
  const id = c.req.param("id");
  const user = c.get("user");

  c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  c.header("Pragma", "no-cache");
  c.header("Expires", "0");

  const [submission] = await sql`
    SELECT grading_status, grade
    FROM exercise_submissions
    WHERE id = ${id} AND user_id = ${user.id}
  `;

  if (!submission) {
    return c.body(null, 404);
  }

  return c.json(submission);
});

export default app;
