import { Redis } from "ioredis";
import postgres from "postgres";

const sql = postgres(Deno.env.get("DATABASE_URL"));

const redisConsumer = new Redis(6379, "redis");

const QUEUE_NAME = "users";

const consume = async () => {
  while (true) {
    const result = await redisConsumer.brpop(QUEUE_NAME, 0);
    console.log(`Processing user: ${result}`);
    if (result) {
      const [queue, user] = result;
      const parsedUser = JSON.parse(user);
      console.log(`Consumer: Saving ${user} to database...`);
      await sql`INSERT INTO users (name) VALUES (${parsedUser.name})`;
    }
  }
};

consume();