import test from 'node:test';
import assert from 'node:assert/strict';
import MiniSearch from 'minisearch';
import { gzipSync } from 'node:zlib';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { createIndex, isIndexableFile, repositoryDocuments } from '../scripts/build-search.js';
import { indexOptions, matchesFilters, sortItems, tokenize, decodeIndexBuffer } from '../scripts/search-shared.js';
import { assetUrl, siteBase } from '../scripts/site-paths.js';

const documents = [
  { id: 'post:a', title: '缓存的边界', summary: '摘要中没有关键词', body: '深处的中文正文包含倒排索引。const uniqueSourceToken = true;', date: '2026-10-16', tags: ['技术'], kind: 'post', url: '/posts/a/', path: '' },
  { id: 'post:b', title: '一次散步', summary: '生活记录', body: '走在小路上。', date: '2026-10-10', tags: ['生活'], kind: 'post', url: '/posts/b/', path: '' },
  { id: 'file:c', title: 'scripts/example.js', summary: '仓库文件', body: 'function dateInTimezone() {}', date: '2026-10-15', tags: [], kind: 'repository', url: 'https://github.com/example/a', path: 'scripts/example.js' },
];
test('序列化索引可搜正文、单个汉字和代码标识符，构建与客户端分词一致', () => {
  const index = MiniSearch.loadJSON(createIndex(documents), indexOptions);
  assert.equal(index.search('倒排索引', { combineWith: 'AND' })[0].id, 'post:a');
  assert.equal(index.search('uniqueSourceToken', { combineWith: 'AND' })[0].id, 'post:a');
  assert.equal(index.search('dateInTimezone', { combineWith: 'AND' })[0].id, 'file:c');
  assert.equal(index.search('缓存')[0].id, 'post:a');
  assert.ok(tokenize('库').includes('库'));
});
test('标签、日期闭区间、文章/仓库范围可以组合查询', () => {
  assert.deepEqual(documents.filter(item => matchesFilters(item, { from: '2026-10-15', to: '2026-10-16', scope: 'pages', tag: '技术' })).map(item => item.id), ['post:a']);
  assert.deepEqual(documents.filter(item => matchesFilters(item, { scope: 'repository' })).map(item => item.id), ['file:c']);
  assert.equal(matchesFilters({ ...documents[0], date: '' }, { from: '2026-01-01' }), false);
});
test('时间升降序稳定，相关度独立排序，不更改原数组', () => {
  assert.deepEqual(sortItems(documents, 'oldest').map(item => item.id), ['post:b', 'file:c', 'post:a']);
  assert.deepEqual(sortItems(documents, 'newest').map(item => item.id), ['post:a', 'file:c', 'post:b']);
  assert.equal(sortItems(documents.map((item, i) => ({ ...item, score: i })), 'relevance')[0].id, 'file:c');
  assert.equal(documents[0].id, 'post:a');
});
test('不索引密钥环境文件、草稿源码、构建产物、二进制和依赖锁', () => {
  for (const file of ['.env', '.env.example', 'artifacts/private.md', 'dist/index.html', 'node_modules/a/b.js', 'src/content/posts/draft.md', 'about/index.md', 'package-lock.json', 'public/assets/a.png']) assert.equal(isIndexableFile(file), false, file);
  for (const file of ['README.md', 'scripts/generate-content.js', '.github/workflows/publish.yml', 'src/styles/global.css', 'examples/demo.py', 'Dockerfile', '.gitignore']) assert.equal(isIndexableFile(file), true, file);
});
test('仓库图片路径兼容本地和 GitHub Pages 子路径，不重复加前缀', () => {
  assert.equal(siteBase({ GITHUB_REPOSITORY: 'RainyTom/PersonalGithubWebsite' }), '/PersonalGithubWebsite');
  assert.equal(siteBase({ GITHUB_REPOSITORY: 'RainyTom/RainyTom.github.io' }), '/');
  assert.equal(assetUrl('/assets/images/example.svg', '/PersonalGithubWebsite'), '/PersonalGithubWebsite/assets/images/example.svg');
  assert.equal(assetUrl('/PersonalGithubWebsite/assets/images/example.svg', '/PersonalGithubWebsite'), '/PersonalGithubWebsite/assets/images/example.svg');
  assert.equal(assetUrl('https://example.com/a.png', '/PersonalGithubWebsite'), 'https://example.com/a.png');
});
test('索引兼容原始 gzip 和 HTTP 层已解压的响应，避免重复解压', async () => {
  const json = createIndex(documents);
  assert.equal(await decodeIndexBuffer(new TextEncoder().encode(json).buffer), json);
  assert.equal(await decodeIndexBuffer(Uint8Array.from(gzipSync(json)).buffer), json);
});
test('全仓库索引不跟随符号链接读取仓库外文件', async t => {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'rainy-search-symlink-'));
  t.after(() => rm(temp, { recursive: true, force: true }));
  const root = path.join(temp, 'repo');
  await mkdir(root);
  execFileSync('git', ['init', '-q', '-b', 'main', root]);
  const outside = path.join(temp, 'outside.md');
  await writeFile(outside, 'outside fixture must not be indexed');
  await writeFile(path.join(root, 'note.md'), 'public text');
  await symlink(outside, path.join(root, 'linked.md'));
  assert.deepEqual((await repositoryDocuments({ root })).map(doc => doc.path), ['note.md']);
});
