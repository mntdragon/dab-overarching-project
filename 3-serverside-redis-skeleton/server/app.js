import { Hono } from "@hono/hono";
import { Redis } from "ioredis";

const app = new Hono();
const REPLICA_ID = crypto.randomUUID();
const redis = new Redis(6379, "redis");


app.use("*", async (c, next) => {
  c.res.headers.set("X-Replica-Id", REPLICA_ID);
  await next();
});

app.get('/', (c) => c.json({ message: "Hello world!" }));


// ---- Redis ----- //
// The producer — the server listening to the POST requests — adds users to the list.

const QUEUE_NAME = "users";

app.post("/users", async (c) => {
  try {
  const { name } = await c.req.json();
  console.log("Received body:", { name });
  await redis.lpush(QUEUE_NAME, JSON.stringify({ name }));
  
  return c.text("Accepted", 202);
  } catch (err) {
    console.error("Server Error:", err);
    return c.text("Internal Server Error", 500);
  }
});


export default app;