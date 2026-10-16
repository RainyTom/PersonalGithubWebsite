import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().min(1).max(120),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    tags: z.array(z.string().min(1)).min(1),
    summary: z.string().min(1).max(300),
    source: z.enum(['manual', 'library', 'openai']).default('manual'),
    draft: z.boolean().default(false),
  }),
});
const about = defineCollection({
  loader: glob({ base: './about', pattern: 'index.md', generateId: ({ entry }) => entry.replace(/\.md$/, '') }),
  schema: z.object({ title: z.string().default('关于'), description: z.string().default('关于 Rainy Tom。') }),
});
export const collections = { posts, about };
