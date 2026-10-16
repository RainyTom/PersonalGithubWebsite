const xml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
export function rssFeed(pages, origin, base) {
  const absolute = route => new URL(`${base.replace(/\/$/, '')}${route}`, origin).href;
  const items = pages.filter(page => page.kind === 'entry').map(page => `<item><title>${xml(page.title)}</title><link>${xml(absolute(page.url))}</link><guid>${xml(absolute(page.url))}</guid><description>${xml(page.summary)}</description>${page.date ? `<pubDate>${new Date(`${page.date}T00:00:00+08:00`).toUTCString()}</pubDate>` : ''}${page.tags.map(tag => `<category>${xml(tag)}</category>`).join('')}</item>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>RainyTom Wiki</title><link>${xml(absolute('/'))}</link><description>知识条目更新</description><language>zh-CN</language>${items}</channel></rss>`;
}
