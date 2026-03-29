import type { Loader } from "astro/loaders";
import { compile } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import rehypeStringify from "rehype-stringify";
import rehypeParse from "rehype-parse";
import { unified } from "unified";

type RemoteDoc = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  bodyMdx: string;
};

const fallback: RemoteDoc[] = [
  {
    id: "remote-1",
    title: "Remote MDX: Live Island Demo (fallback)",
    summary: "Fallback data used when API is unreachable during build.",
    updatedAt: new Date().toISOString(),
    bodyMdx: `
import RealtimeIsland from "@components/RealtimeIsland.svelte";

# Remote Content (fallback)

<RealtimeIsland client:load />
    `.trim(),
  },
];

async function mdxToHtml(mdx: string): Promise<string> {

  const file = await compile(mdx, {
    outputFormat: "function-body",
    rehypePlugins: [rehypeStringify],
    remarkPlugins: [remarkFrontmatter],
  });


  return String(file);
}

export const highLevelLoader = (): Loader => ({
  name: "highLevelLoader",
  load: async ({ store, logger }) => {
    const url =
      process.env.HIGH_LEVEL_URL ?? "http://localhost:8000/api/content/high-level";

    let items: RemoteDoc[] = fallback;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      items = await res.json();
      logger.info(`Loaded ${items.length} remote docs from ${url}`);
    } catch (err) {
      logger.warn(`Remote fetch failed (${url}). Using fallback. ${String(err)}`);
    }

    for (const item of items) {
      // Store raw MDX for now
      store.set({
        id: item.id,
        data: item,
      });
    }
  },
});
