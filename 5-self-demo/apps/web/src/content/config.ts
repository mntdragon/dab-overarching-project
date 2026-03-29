import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { highLevelLoader } from "../loaders/highLevel";

const basic = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/basic" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    pubDate: z.coerce.date(),
  }),
});

const highLevel = defineCollection({
  loader: highLevelLoader(),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    updatedAt: z.string(),
    bodyMdx: z.string(),
  }),
});

export const collections = { basic, highLevel };
