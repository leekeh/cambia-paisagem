import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const localisedString = z.object({
  pt: z.string(),
  en: z.string(),
  de: z.string(),
});

const tours = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/tours" }),
  schema: ({ image }) =>
    z.object({
      slug: z.string(),
      image: image(),
      price: z.number(),
      duration: z.number(), // hours
      title: localisedString,
      description: localisedString,
      highlights: z.object({
        pt: z.array(z.string()),
        en: z.array(z.string()),
        de: z.array(z.string()),
      }),
      category: z.string().optional(),
    }),
});

const reviews = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/reviews" }),
  schema: z.object({
    rating: z.number().min(1).max(5),
    author: z.string(),
    date: z.string(), // ISO date string e.g. "2024-08-15"
    summary: localisedString,
    content: localisedString,
    tourSlug: z.string().optional(),
  }),
});

export const collections = { tours, reviews };
