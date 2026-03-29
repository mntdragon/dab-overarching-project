import { Hono } from "@hono/hono";
import postgres from "postgres";
import { Redis } from "ioredis";

const app = new Hono();
const sql = postgres(Deno.env.get("DATABASE_URL"));

const cache = new Map();

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
const QUEUE_NAME = "submissions";
app.post("/api/exercises/:id/submissions", async (c) => {
  try {
  const exerciseId = c.req.param("id");
const { source_code } = await c.req.json();

 const [submission] = await sql`
    INSERT INTO exercise_submissions (exercise_id, source_code)
    VALUES (${exerciseId}, ${source_code})
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
 * Step 5:GET /api/exercises/:id
 * Retrieves a single exercise. Returns 404 with empty body if not found.
 */
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

app.post("/api/exercises/:id/submissions", async (c) => {
  try {
    const exerciseId = c.req.param("id");
    const { source_code } = await c.req.json();

    const [submission] = await sql`
      INSERT INTO exercise_submissions (exercise_id, source_code)
      VALUES (${exerciseId}, ${source_code})
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
 * Step 5: GET /api/submissions/:id/status
 * Retrieves status for a submission. Returns 404 with empty body if not found.
 * Caching is disabled via headers.
 */
app.get("/api/submissions/:id/status", async (c) => {
  const id = c.req.param("id");

  // Disable caching for this response
  c.header("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  c.header("Pragma", "no-cache");
  c.header("Expires", "0");

  const [submission] = await sql`
    SELECT grading_status, grade
    FROM exercise_submissions
    WHERE id = ${id}
  `;

  if (!submission) {
    return c.body(null, 404);
  }

  return c.json(submission);
});

export default app;