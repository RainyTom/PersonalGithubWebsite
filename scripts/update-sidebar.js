import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildWiki, writeIfChanged } from './wiki.js';
export async function updateSidebar(root = path.resolve('docs'), options = {}) {
  const result = await buildWiki(root, options);
  const generated = path.join(root, '.vitepress/generated');
  for (const [name, value] of Object.entries({ sidebar: result.sidebar, catalog: { pages: result.pages, categories: result.categories }, excluded: result.excluded })) {
    await writeIfChanged(path.join(generated, `${name}.json`), `${JSON.stringify(value, null, 2)}\n`);
  }
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  updateSidebar().then(data => console.log(`目录已同步：${data.pages.filter(p => p.kind === 'entry').length} 篇条目，${data.categories.length} 个分类`)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
