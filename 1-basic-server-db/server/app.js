import { Hono } from "@hono/hono";
import postgres from "postgres";

const app = new Hono();
const sql = postgres(Deno.env.get("DATABASE_URL"));

const cache = new Map();

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

export default app;