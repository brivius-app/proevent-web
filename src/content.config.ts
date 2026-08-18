import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Colección "Categorías del portfolio".
// Cada archivo JSON en src/content/portfolio representa una categoría editable
// desde Decap CMS.
const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/portfolio' }),
  schema: z.object({
    slug: z.string().optional(),
    label: z.string(),
    title: z.string(),
    order: z.number().default(0),
    cover: z.string(),
    gallery: z.array(z.string()).default([]),
  }),
});

export const collections = { portfolio };
