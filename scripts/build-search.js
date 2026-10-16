import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import MiniSearch from 'minisearch';
import { indexOptions } from './search-shared.js';

export function isIndexableFile(file) {
  if (file.split('/').some(part => ['node_modules', 'dist', 'artifacts', '.git', '.astro'].includes(part) || part.startsWith('.env'))) return false;
  if (/(^|\/)(package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/.test(file)) return false;
  if (file.startsWith('src/content/posts/') || file === 'about/index.md') return false; // 页面已单独索引，草稿不暴露。
  return /(^|\/)(\.gitignore|LICENSE|Makefile|Dockerfile)$/.test(file) || /\.(md|txt|astro|[cm]?js|[cm]?ts|jsx|tsx|css|json|ya?ml|svg|html|xml|toml|py|c|cpp|h|rs|go|java|vue|svelte|sql|sh|bash|zsh|csv)$/.test(file);
}
export function createIndex(documents) {
  const index = new MiniSearch(indexOptions);
  index.addAll(documents.map(doc => ({ ...doc, tagsText: doc.tags.join(' ') })));
  return JSON.stringify(index);
}
export async function repositoryDocuments({ root = process.cwd(), github = 'https://github.com/RainyTom/PersonalGithubWebsite' } = {}) {
  // -z 正确处理含空格的路径；本地新增且未忽略的源码也可预览搜索。
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }).split('\0').filter(isIndexableFile);
  const result = [];
  for (const file of new Set(files)) {
    const absolute = path.join(root, file);
    let body;
    try {
      if ((await stat(absolute)).size > 1024 * 1024) continue;
      body = await readFile(absolute, 'utf8');
    } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (body.includes('\0')) continue;
    let date = '';
    try { date = execFileSync('git', ['log', '-1', '--format=%cs', '--', file], { cwd: root, encoding: 'utf8' }).trim(); } catch {}
    result.push({ id: `file:${file}`, title: file, summary: `仓库文件 · ${file}`, path: file, date, tags: [], kind: 'repository', url: `${github}/blob/main/${file.split('/').map(encodeURIComponent).join('/')}`, body });
  }
  return result;
}
