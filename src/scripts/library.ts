import { matchesFilters, sortItems } from '../../scripts/search-shared.js';
import type { SearchItem, Filters } from './search-types';
const library = document.querySelector<HTMLElement>('#library');
if (library) {
  const all: SearchItem[] = JSON.parse(document.querySelector('#post-metadata')?.textContent || '[]');
  const form = document.querySelector<HTMLFormElement>('#library-controls')!;
  const input = document.querySelector<HTMLInputElement>('#content-search')!;
  const order = document.querySelector<HTMLSelectElement>('#sort-order')!;
  const scope = document.querySelector<HTMLSelectElement>('#search-scope')!;
  const from = document.querySelector<HTMLInputElement>('#date-from')!;
  const to = document.querySelector<HTMLInputElement>('#date-to')!;
  const status = document.querySelector<HTMLElement>('#result-status')!;
  const list = document.querySelector<HTMLElement>('#article-results')!;
  const pager = document.querySelector<HTMLElement>('#results-pagination')!;
  const title = document.querySelector<HTMLElement>('#articles-heading')!;
  const clearTag = document.querySelector<HTMLButtonElement>('#clear-category')!;
  const base = library.dataset.base!;
  let tag = '', page = Number(library.dataset.current) || 1, sequence = 0;
  let items: SearchItem[] = all, worker: Worker | undefined, debounce: ReturnType<typeof setTimeout>;
  let sortChosen = false;
  const filters = (): Filters => ({ tag, from: from.value, to: to.value, scope: scope.value, order: order.value });
  function readURL() {
    const params = new URLSearchParams(location.search);
    sortChosen = params.has('order');
    input.value = (params.get('q') || '').slice(0, 160);
    tag = params.get('tag') || '';
    order.value = ['newest', 'oldest', 'relevance'].includes(params.get('order') || '') ? params.get('order')! : (input.value ? 'relevance' : 'newest');
    scope.value = ['all', 'pages', 'repository'].includes(params.get('scope') || '') ? params.get('scope')! : 'all';
    from.value = params.get('from') || ''; to.value = params.get('to') || '';
    page = Math.max(1, Math.floor(Number(params.get('page')) || Number(library?.dataset.current) || 1));
  }
  function syncURL() {
    const url = new URL(base, location.origin);
    const values = { q: input.value.trim(), tag, order: order.value, scope: scope.value, from: from.value, to: to.value, page: page > 1 ? String(page) : '' };
    for (const [name, value] of Object.entries(values)) if (value && !(name === 'scope' && value === 'all') && !(name === 'order' && value === 'newest')) url.searchParams.set(name, value);
    history.replaceState(null, '', `${url.pathname}${url.search}`);
  }
  function highlight(element: HTMLElement, value: string) {
    const query = input.value.trim();
    const index = query ? value.toLowerCase().indexOf(query.toLowerCase()) : -1;
    if (index < 0) { element.textContent = value; return; }
    const mark = document.createElement('mark'); mark.textContent = value.slice(index, index + query.length);
    element.append(value.slice(0, index), mark, value.slice(index + query.length));
  }
  function render(sync = true) {
    const total = Math.max(1, Math.ceil(items.length / 5));
    page = Math.min(page, total);
    const fragment = document.createDocumentFragment();
    for (const item of items.slice((page - 1) * 5, page * 5)) {
      const card = document.createElement('article'); card.className = 'post-card'; card.dataset.kind = item.kind;
      const meta = document.createElement('div'); meta.className = 'post-meta';
      const time = document.createElement('time'); time.textContent = item.date ? item.date.replaceAll('-', '.') : '未标注日期'; if (item.date) time.dateTime = item.date;
      const divider = document.createElement('span'); divider.textContent = '/'; divider.setAttribute('aria-hidden', 'true');
      const kind = document.createElement('span'); kind.textContent = item.kind === 'repository' ? '仓库文件' : item.kind === 'page' ? '页面' : item.tags[0] || '文章';
      meta.append(time, divider, kind);
      const heading = document.createElement('h2'), link = document.createElement('a');
      link.href = item.url; highlight(link, item.title);
      if (item.kind === 'repository') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      const arrow = document.createElement('span'); arrow.className = 'post-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); link.append(arrow); heading.append(link);
      const summary = document.createElement('p'); highlight(summary, item.summary);
      card.append(meta, heading, summary); fragment.append(card);
    }
    if (!items.length) {
      const empty = document.createElement('div'); empty.className = 'empty-state';
      const heading = document.createElement('h3'); heading.textContent = '没有找到相关内容';
      const description = document.createElement('p'); description.textContent = '换个关键词，或放宽分类与日期范围再试一次。';
      empty.append(heading, description); fragment.append(empty);
    }
    list.replaceChildren(fragment);
    pager.replaceChildren();
    const pageLabel = document.createElement('span'); pageLabel.textContent = `第 ${page} / ${total} 页`;
    const actions = document.createElement('div');
    for (const [next, text] of [[page - 1, '← 上一页'], [page + 1, '下一页 →']] as const) {
      if (next < 1 || next > total) continue;
      const a = document.createElement('a'); a.textContent = text;
      const target = new URL(base, location.origin); target.search = location.search; target.searchParams.set('page', String(next)); a.href = `${target.pathname}${target.search}`;
      a.addEventListener('click', event => { event.preventDefault(); page = next; render(); title.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); });
      actions.append(a);
    }
    pager.append(pageLabel, actions);
    const count = document.createElement('span'); count.id = 'total-count'; count.textContent = String(items.length).padStart(2, '0');
    title.replaceChildren(document.createTextNode(input.value.trim() ? '搜索结果 ' : tag || '全部文章 '), count);
    status.textContent = input.value.trim() ? `找到 ${items.length} 条内容` : `${tag ? `${tag} · ` : ''}共 ${items.length} ${scope.value === 'all' ? '篇文章' : '条内容'}${from.value || to.value ? ' · 已按日期筛选' : ''}`;
    clearTag.hidden = !tag;
    document.querySelectorAll<HTMLAnchorElement>('#category-nav a').forEach(a => {
      const selected = a.dataset.tag === tag; a.classList.toggle('selected', selected);
      if (selected) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    if (sync) syncURL();
  }
  function ensureWorker() {
    if (!worker) {
      worker = new Worker(new URL('./search-worker.ts', import.meta.url), { type: 'module' });
      worker.onmessage = event => {
        if (event.data.id !== sequence) return;
        if (event.data.error) { status.textContent = event.data.error; return; }
        items = event.data.items; render();
      };
      worker.onerror = () => { status.textContent = '搜索加载失败，请刷新重试。分类和日期筛选仍可使用。'; worker?.terminate(); worker = undefined; };
    }
    return worker;
  }
  function update(sync = true) {
    const id = ++sequence;
    if (from.value && to.value && from.value > to.value) { status.textContent = '开始日期不能晚于结束日期。'; return; }
    if (!input.value.trim() && scope.value === 'all') {
      items = sortItems(all.filter(item => matchesFilters(item, filters())), order.value); render(sync); return;
    }
    status.textContent = '正在检索…';
    if (sync) syncURL();
    ensureWorker().postMessage({ id, query: input.value.trim(), filters: filters(), url: new URL(library!.dataset.index!, location.origin).href });
  }
  input.addEventListener('input', () => {
    page = 1;
    if (!sortChosen) order.value = input.value.trim() ? 'relevance' : 'newest';
    clearTimeout(debounce); debounce = setTimeout(() => update(), 180);
  });
  form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(debounce); page = 1; update(); });
  [order, scope, from, to].forEach(control => control.addEventListener('change', () => { if (control === order) sortChosen = true; page = 1; update(); }));
  document.querySelectorAll<HTMLAnchorElement>('#category-nav a').forEach(a => a.addEventListener('click', event => { event.preventDefault(); tag = a.dataset.tag || ''; page = 1; update(); }));
  clearTag.addEventListener('click', () => { tag = ''; page = 1; update(); });
  document.querySelector('#reset-filters')?.addEventListener('click', () => { input.value = ''; tag = ''; from.value = ''; to.value = ''; scope.value = 'all'; order.value = 'newest'; page = 1; sortChosen = false; update(); });
  window.addEventListener('popstate', () => { readURL(); update(false); });
  readURL(); update(false);
  if (new URLSearchParams(location.search).get('focus') === 'search') requestAnimationFrame(() => input.focus());
}
