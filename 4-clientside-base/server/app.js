import { Hono } from "@hono/hono";
import { cors } from "@hono/hono/cors";

const app = new Hono();
app.use(cors());

// create one thousand items and renders them into a list on an HTML page
// A 20 millisecond delay is added to the data fetching to simulate a scenario 
// where the data is retrieved e.g. from a database.
const getItems = async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const items = Array.from(
    { length: 1000 },
    (_, i) => ({ id: i, name: `Item ${i}` }),
  );
  return items;
};

app.get("/ssr", async (c) => {
  const items = await getItems();

  return c.html(`<html>
    <head>
    </head>
    <body>
      <ul>
        ${items.map((item) => `<li>${item.name}</li>`).join("")}
      </ul>
    </body>
  </html>`);
});

// Client-Side Rendering 
// a middleware for serving static files from the public folder, 
// and create an endpoint for fetching the items.
app.use("/public/*", serveStatic({ root: "." }));

app.get("/items", async (c) => {
  const items = await getItems();
  return c.json(items);
});

// hybrid rendering - SSG + CSR
const getInitialItems = async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
};

const getRemainingItems = async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  return Array.from(
    { length: 900 },
    (_, i) => ({ id: i + 100, name: `Item ${i + 100}` }),
  );
};

app.get("/items/remaining", async (c) => {
  const items = await getRemainingItems();
  return c.json(items);
});

app.get("/hybrid", async (c) => {
  const items = await getInitialItems();

  return c.html(`<html>
    <head>
      <script>
        document.addEventListener("DOMContentLoaded", async () => {
          const list = document.getElementById("list");
          const items = await fetch("http://localhost:8000/items/remaining");
          const json = await items.json();
          for (const item of json) {
            const li = document.createElement("li");
            li.textContent = item.name;
            list.appendChild(li);
          }
        });
      </script>
    </head>
    <body>
      <ul id="list">
        ${items.map((item) => `<li>${item.name}</li>`).join("")}
      </ul>
    </body>
  </html>`);
});

// Lazy load for retrieving and rendering the remaining items into a separate function
// only loaded when the user scrolls down to view them
app.get("/hybrid/lazyload", async (c) => {
  const items = await getInitialItems();

  return c.html(`<html>
    <head>
      <script>
        document.addEventListener("DOMContentLoaded", () => {
          const observer = new IntersectionObserver((entries, obs) => {
            if (entries[0].isIntersecting) {
              import("/public/loadRemaining.js").then((module) => {
                module.loadRemaining();
              });
              obs.disconnect();
            }
          });

          observer.observe(document.getElementById('last'));
        });
      </script>
    </head>
    <body>
      <ul id="list">
        ${items.map((item) => `<li>${item.name}</li>`).join("")}
        <li id="last">Loading...</li>
      </ul>
    </body>
  </html>`);
});

export default app;