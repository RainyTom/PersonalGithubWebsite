// 构建端和 Worker 共用分词与过滤规则，避免浏览器与索引语义不一致。
export function tokenize(text) {
  const original = String(text).normalize('NFKC');
  const normalized = original.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  const latin = [...(normalized.match(/[a-z0-9]+/g) || []), ...(original.toLowerCase().match(/[a-z0-9]+/g) || [])];
  const han = normalized.match(/[\u3400-\u9fff]+/g) || [];
  const chinese = han.flatMap(run => [...run, ...Array.from({ length: run.length - 1 }, (_, i) => run.slice(i, i + 2))]);
  return [...new Set([...latin, ...chinese])];
}
export function matchesFilters(item, filters = {}) {
  if (filters.scope === 'repository' && item.kind !== 'repository') return false;
  if (filters.scope === 'pages' && item.kind === 'repository') return false;
  if (filters.tag && !item.tags.includes(filters.tag)) return false;
  if (filters.from && (!item.date || item.date < filters.from)) return false;
  if (filters.to && (!item.date || item.date > filters.to)) return false;
  return true;
}
export function sortItems(items, order = 'newest') {
  return [...items].sort((a, b) => {
    if (order === 'relevance') return (b.score || 0) - (a.score || 0) || b.date.localeCompare(a.date) || a.id.localeCompare(b.id);
    // 无已知日期的文件始终排在已知日期之后。
    if (!a.date !== !b.date) return a.date ? -1 : 1;
    return (order === 'oldest' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)) || a.id.localeCompare(b.id);
  });
}
export function snippet(body, query, fallback = '') {
  const text = String(body || fallback).replace(/\s+/g, ' ').trim();
  const lower = text.toLowerCase();
  let position = query ? lower.indexOf(query.toLowerCase()) : 0;
  if (position < 0) position = tokenize(query).map(term => lower.indexOf(term)).find(index => index >= 0) ?? 0;
  const start = Math.max(0, position - 55);
  return `${start ? '…' : ''}${text.slice(start, start + 210)}${text.length > start + 210 ? '…' : ''}`;
}
export const indexOptions = {
  fields: ['title', 'summary', 'tagsText', 'body', 'path'],
  storeFields: ['title', 'summary', 'date', 'tags', 'kind', 'url', 'path', 'body'],
  tokenize,
};
export async function decodeIndexBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  // 有些静态服务器为 .gz 设置 Content-Encoding，fetch 已自动解压；
  // GitHub Pages 也可能按普通 gzip 文件发送，因此检查实际字节而非猜测响应头。
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return new Response(new Response(buffer).body.pipeThrough(new DecompressionStream('gzip'))).text();
  }
  return new TextDecoder().decode(buffer);
}
