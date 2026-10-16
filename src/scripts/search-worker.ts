/// <reference lib="webworker" />
import MiniSearch from 'minisearch';
import { indexOptions, matchesFilters, sortItems, snippet, decodeIndexBuffer } from '../../scripts/search-shared.js';
import type { SearchItem, Filters } from './search-types';
let loaded: Promise<MiniSearch> | undefined;
function load(url: string) {
  return loaded ??= (async () => {
    let json: string;
    if ('DecompressionStream' in globalThis) {
      const compressed = new URL(url); compressed.pathname += '.gz';
      const response = await fetch(compressed);
      if (!response.ok || !response.body) throw new Error('索引加载失败');
      json = await decodeIndexBuffer(await response.arrayBuffer());
    } else {
      const response = await fetch(url);
      if (!response.ok) throw new Error('索引加载失败');
      json = await response.text();
    }
    return MiniSearch.loadJSON(json, indexOptions);
  })().catch(error => { loaded = undefined; throw error; });
}
self.onmessage = async (event: MessageEvent<{ id: number; query: string; filters: Filters; url: string }>) => {
  const { id, query, filters, url } = event.data;
  try {
    const index = await load(url);
    const results = index.search(query || MiniSearch.wildcard, {
      combineWith: 'AND', prefix: term => term.length > 1, boost: { title: 5, summary: 2, tagsText: 2 },
      filter: item => matchesFilters(item, filters),
    });
    const items = sortItems(results, filters.order).map(item => ({ ...item, summary: query ? snippet(item.body, query, item.summary) : item.summary, body: undefined })) as SearchItem[];
    self.postMessage({ id, items });
  } catch { self.postMessage({ id, error: '全文索引暂时不可用，请稍后重试。分类和时间筛选仍可使用。' }); }
};
