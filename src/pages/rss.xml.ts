import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../config';
import { allPosts, postHref, href } from '../lib/posts';
export async function GET(context: APIContext) {
  return rss({
    title: site.title,
    description: site.description,
    site: new URL(href(), context.site),
    items: (await allPosts()).map(post => ({ title: post.data.title, pubDate: new Date(`${post.data.date}T00:00:00+08:00`), description: post.data.summary, link: postHref(post), categories: post.data.tags })),
    customData: '<language>zh-cn</language>',
  });
}
