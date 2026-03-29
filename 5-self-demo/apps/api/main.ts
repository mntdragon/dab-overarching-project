import { app } from "./src/index.ts";

Deno.serve({ hostname: "0.0.0.0", port: 3000 }, app.fetch);
console.log("API listening on http://0.0.0.0:3000");


