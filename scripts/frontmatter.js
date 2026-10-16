import { parse } from 'yaml';

export default function frontmatter(text) {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(text);
  if (!match) throw new Error('Markdown 缺少合法 frontmatter');
  const data = parse(match[1], { maxAliasCount: 20, uniqueKeys: true });
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('frontmatter 必须是键值对象');
  return { data, content: text.slice(match[0].length) };
}
