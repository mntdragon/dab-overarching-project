import { Hono } from "@hono/hono";
import postgres from "postgres";
import { Redis } from "ioredis";

const app = new Hono();
const REPLICA_ID = crypto.randomUUID();
const databaseUrl = Deno.env.get("DATABASE_URL");
const sql = postgres(databaseUrl);
const redis = new Redis(6379, "redis");


app.use("*", async (c, next) => {
  c.res.headers.set("X-Replica-Id", REPLICA_ID);
  await next();
});

app.get('/', (c) => c.json({ message: "Hello world!" }));

app.post("/users", async (c) => {
  const { name } = await c.req.json();
  const user = await sql`INSERT INTO users (name) VALUES (${name})`;
  c.status(202);
  return c.body("Accepted");
});

// ---- Redis ----- //
// 1. Middleware that checks whether there exists a corresponding result for the request in the cache cache, and if yes return the result.
const redisCacheMiddleware = async (c, next) => {
  const cachedResponse = await redis.get(c.req.url);
  if (cachedResponse) {
    const res = JSON.parse(cachedResponse);
    return Response.json(res.json, res);
  }

  await next();

  if (!c.res.ok) {
    return;
  }

  const clonedResponse = c.res.clone();

  const res = {
    status: clonedResponse.status,
    statusText: clonedResponse.statusText,
    headers: Object.fromEntries(clonedResponse.headers),
    json: await clonedResponse.json(),
  };

  await redis.set(c.req.url, JSON.stringify(res));
};

// a simple route that increments a value in the cache
app.get("/redis-test", async (c) => {
  let count = await redis.get("test");
  if (!count) {
    count = 0;
  } else {
    count = Number(count);
  }

  count++;

  await redis.set("test", count);
  return c.json({ count });
});

app.get(
  "/hello/*",
  redisCacheMiddleware,
);

app.get(
  "/hello/:name",
  async (c) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return c.json({ message: `Hello ${c.req.param("name")}!` });
  },
);

// 2. Redis list used as a message queue
// The consumer listens to the list and processes the messages by adding the user to the database.
const redisConsumer = new Redis(6379, "redis");
// The producer — the server listening to the POST requests — adds users to the list.
const redisProducer = new Redis(6379, "redis");

const QUEUE_NAME = "users";

const consume = async () => {
  while (true) {
    const result = await redisConsumer.brpop(QUEUE_NAME, 0);
    if (result) {
      const [queue, user] = result;
      const { name } = JSON.parse(user);
      await sql`INSERT INTO users (name) VALUES (${name})`;
    }
  }
};

consume();

app.post("/redis/users", async (c) => {
  const { name } = await c.req.json();
  await redisProducer.lpush(QUEUE_NAME, JSON.stringify({ name }));
  c.status(202);
  return c.body("Accepted");
});

export default app;