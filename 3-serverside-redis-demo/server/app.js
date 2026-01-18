import { Hono } from "@hono/hono";
import { Redis } from "ioredis";

// Do not modify these
const REDIS_CONTAINER_NAME = Deno.env.get("REDIS_HOST");
const REDIS_CONTAINER_PORT = Deno.env.get("REDIS_PORT");
const QUEUE_NAME = "PING_QUEUE";

const redis = new Redis(6379, "redis");

const app = new Hono();
app.use('*', async (c, next) => {
  console.log(`${c.req.method} ${c.req.url}`)
  await next()
})
/**
 * POST /ping
 * Adds "ping" to the PING_QUEUE list and responds with "pong".
 */

app.post("/ping", async (c) => {
  try {
    await redis.lpush(QUEUE_NAME, 'ping');
    return c.text('pong')
  } catch (err) {
    return c.text('Redis Error', 500)
}
})

/**
 * GET /pong
 * Checks queue size and pops a message if available.
 */
app.get('/pong', async (c) => {
  try {
     const size = await redis.llen(QUEUE_NAME);

  if (size === 0) {
    return c.text('Queue empty');
  }

  const message = await redis.rpop(QUEUE_NAME);
  return c.text(message);
}catch (err) {
    return c.text('Redis Error', 500)
}}
);

export default app;
