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

export default app;