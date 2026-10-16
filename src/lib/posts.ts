import { getCollection, type CollectionEntry } from 'astro:content';
export type Post = CollectionEntry<'posts'>;
export const href = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const tagHref = (tag: string) => href(`tags/${encodeURIComponent(tag)}/`);
export const postHref = (post: Post) => href(`posts/${post.id}/`);
export const displayDate = (date: string) => date.replaceAll('-', '.');
export async function allPosts() {
  return (await getCollection('posts', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}
export function tagCounts(posts: Post[]) {
  const counts = new Map<string, number>();
  for (const post of posts) for (const tag of new Set(post.data.tags)) counts.set(tag, (counts.get(tag) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-CN'));
}
