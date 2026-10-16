import { getEntry } from 'astro:content';
import { allPosts, postHref, href } from './posts';
import { site } from '../config';
import { createIndex, repositoryDocuments } from '../../scripts/build-search.js';
let cached: Promise<string> | undefined;
export function searchIndex() {
  return cached ??= (async () => {
    const posts = await allPosts();
    const documents = posts.map(post => ({ id: `post:${post.id}`, title: post.data.title, summary: post.data.summary, date: post.data.date, tags: post.data.tags, kind: 'post', url: postHref(post), path: `src/content/posts/${post.id}.md`, body: post.body || '' }));
    const profile = await getEntry('about', 'index');
    if (profile) documents.push({ id: 'page:about', title: profile.data.title, summary: profile.data.description, date: '', tags: [], kind: 'page', url: href('about/'), path: 'about/index.md', body: profile.body || '' });
    return createIndex([...documents, ...await repositoryDocuments({ github: site.github })]);
  })();
}
