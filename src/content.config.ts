import {defineCollection, z} from 'astro:content';
import {glob} from 'astro/loaders';

const projects = defineCollection({
  loader: glob({pattern: '**/*.{md,mdx}', base: './src/content/projects'}),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    year: z.number(),
    featured: z.boolean().default(false),
    url: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = {projects};
