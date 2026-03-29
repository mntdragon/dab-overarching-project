import { Hono } from "@hono/hono";
import postgres from "postgres";
import { Redis } from "ioredis";

const app = new Hono();
const sql = postgres(Deno.env.get("DATABASE_URL"));


let redis;
if (Deno.env.get("REDIS_HOST")) {
  redis = new Redis(
    Number.parseInt(Deno.env.get("REDIS_PORT")),
    Deno.env.get("REDIS_HOST"),
  );
} else {
  redis = new Redis(6379, "redis");
}

const REDIS_QUEUE_NAME = "submissions";

///Application-level state
let consume_enabled = false;

/// grading functions
const startGrading = async () => {
  console.log("!!! GRADER LOOP STARTING !!!");
  while (true) {
    if (consume_enabled) {
      // 1. check if there are items on the queue
      const subId = await redis.lpop(REDIS_QUEUE_NAME, 1);
      console.log(`Popped submission ID: ${subId}`);
      if (subId === null || subId === undefined || subId.length === 0) {
        // Queue is empty: sleep for 250ms before checking again
        await new Promise((resolve) => setTimeout(resolve, 250));
        continue;
      }
      // 2. mark submission as 'processing' in the database
      await sql`UPDATE exercise_submissions
      SET grading_status = 'processing'
      WHERE id = ${subId}
    `;
      // 3. Sleep random 1-3s
      const randomSleep = Math.floor(Math.random() * 2000) + 1000;
      await new Promise((resolve) => setTimeout(resolve, randomSleep));

      // update submission as 'graded' with random grade in the database
      const randomGrade = Math.floor(Math.random() * 101);
      await sql`UPDATE exercise_submissions
    SET grading_status = 'graded', grade = ${randomGrade}
    WHERE id = ${subId}
  `;
      console.log(`Finished submission ${subId} with grade ${randomGrade}`);
    } else {
      // Consumption disabled: wait 500ms before checking the flag again
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
};
// Start the loop (it runs in the background)
startGrading();

/// API Endpoints

/**
 * Retrieve the size of the queue from Redis, and use a application-level variable for consume_enable.
 */
app.get("/api/status", async (c) => {
  const queuesize = await redis.llen(REDIS_QUEUE_NAME);

  return c.json({
    queue_size: queuesize,
    consume_enabled: consume_enabled
  });
});

/**
 * Start consuming messages from the Redis queue "submissions" and grading
 */
app.post("/api/consume/enable", async (c) => {
  consume_enabled = true;
  return c.json({ consume_enabled: true });
});

app.post("/api/consume/disable", async (c) => {
  consume_enabled = false;
  return c.json({ consume_enabled: false });
});


export default app;