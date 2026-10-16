import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { dateInTimezone, generate, validateArticle, validateTopics } from '../scripts/generate-content.js';
import frontmatter from '../scripts/frontmatter.js';
import { parse } from 'yaml';

const env = { OPENAI_API_KEY: 'test-only', OPENAI_MODEL: 'mock-model' };
const article = { title: '可验证的自动化发布', summary: '比较失败策略与幂等边界。', tags: ['自动化', '测试'], body: '# 可验证的自动化发布\n\n## 前提\n\n' + '这是一个受控示例，讨论输入、输出和可观察的失败行为。'.repeat(20) + '\n\n| 操作 | 行为 |\n| --- | --- |\n| 重试 | 保持幂等 |\n' };
const response = () => Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(article) } }] });
async function setup(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'wiki-generation-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'wiki'));
  const topicsFile = path.join(root, 'topics.yaml');
  await writeFile(topicsFile, 'topics:\n  - title: 自动化\n    path: engineering/automation\n    categories: [工程实践, 自动化]\n    tags: [DevOps]\n');
  return { root, topicsFile, categoryFile: path.join(root, 'category.config.yaml'), now: new Date('2026-10-16T04:00:00Z'), env };
}
test('北京时间跨日边界', () => {
  assert.equal(dateInTimezone(new Date('2026-10-15T15:59:59Z')), '2026-10-15');
  assert.equal(dateInTimezone(new Date('2026-10-15T16:00:00Z')), '2026-10-16');
});
test('没有凭据时不写占位文章、不调用 API', async t => {
  const options = await setup(t);
  const result = await generate({ ...options, env: {}, fetchImpl: () => { throw new Error('不应请求'); } });
  assert.equal(result.created, false);
  assert.match(result.reason, /未配置/);
  assert.deepEqual(await readdir(path.join(options.root, 'wiki')), []);
});
test('生成文章及层级别名、目录索引；当天重复运行不调用 API', async t => {
  const options = await setup(t);
  let calls = 0;
  const fetchImpl = async (url, init) => { calls++; assert.equal(url, 'https://api.openai.com/v1/chat/completions'); assert.equal(JSON.parse(init.body).response_format.type, 'json_object'); return response(); };
  const first = await generate({ ...options, fetchImpl });
  assert.equal(first.created, true);
  assert.equal(frontmatter(await readFile(first.file, 'utf8')).data.source, 'openai');
  assert.match(await readFile(options.categoryFile, 'utf8'), /工程实践/);
  await assert.rejects(readFile(path.join(options.root, 'wiki/engineering/.category.config.yaml')), { code: 'ENOENT' });
  const catalog = JSON.parse(await readFile(path.join(options.root, '.vitepress/generated/catalog.json'), 'utf8'));
  assert.equal(catalog.pages.length, 1);
  assert.equal((await generate({ ...options, fetchImpl })).created, false);
  assert.equal(calls, 1);
});
test('手写文章不占用 AI 配额，下一天仍可生成；已有分类别名不覆盖', async t => {
  const options = await setup(t);
  await writeFile(path.join(options.root, 'wiki/manual.md'), '---\ntitle: 手写\ndate: "2026-10-16"\nsource: manual\n---\n# 手写');
  await mkdir(path.join(options.root, 'wiki/engineering'));
  await writeFile(path.join(options.root, 'wiki/engineering/.category.config.yaml'), 'name: 我的工程目录\norder: 4\n');
  await generate({ ...options, fetchImpl: async () => response() });
  const next = await generate({ ...options, now: new Date('2026-10-17T04:00:00Z'), fetchImpl: async () => Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ ...article, title: '下一天的独立条目' }) } }] }) });
  assert.equal(next.created, true);
  assert.match(await readFile(path.join(options.root, 'wiki/engineering/.category.config.yaml'), 'utf8'), /我的工程目录/);
});
test('API 失败无文章和空分类残留，锁释放后可重试', async t => {
  const options = await setup(t);
  await assert.rejects(generate({ ...options, fetchImpl: async () => new Response('private-body', { status: 429 }) }), /HTTP 429/);
  assert.deepEqual(await readdir(path.join(options.root, 'wiki')), []);
  assert.equal((await generate({ ...options, fetchImpl: async () => response() })).created, true);
});
test('不允许模板代码、无结构正文、路径穿越和别名冲突', () => {
  assert.throws(() => validateArticle({ ...article, body: article.body + '\n<script>alert(1)</script>' }), /HTML\/Vue/);
  assert.throws(() => validateArticle({ ...article, body: article.body + '\n{{ process.env }}' }), /HTML\/Vue/);
  assert.throws(() => validateArticle({ ...article, body: '普通正文'.repeat(100) }), /表格或 Mermaid/);
  assert.throws(() => validateTopics({ topics: [{ title: 'x', path: '../outside', categories: ['x'], tags: ['x'] }] }), /path/);
  assert.throws(() => validateTopics({ topics: [{ title: 'a', path: 'same/a', categories: ['A', 'a'], tags: ['x'] }, { title: 'b', path: 'same/b', categories: ['B', 'b'], tags: ['x'] }] }), /别名冲突/);
});
test('并发生成只调用一次 API', async t => {
  const options = await setup(t);
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  let requested;
  const started = new Promise(resolve => { requested = resolve; });
  const first = generate({ ...options, fetchImpl: async () => { requested(); await gate; return response(); } });
  await started;
  await assert.rejects(generate({ ...options, fetchImpl: async () => { throw new Error('不应重复调用'); } }), /另一个/);
  release();
  assert.equal((await first).created, true);
});
test('AI 填入预声明空分类时保留全局别名和排序，不重复创建分类', async t => {
  const options = await setup(t);
  await writeFile(options.categoryFile, 'name: 我的知识库\ncategories:\n  - path: engineering\n    name: 全局工程别名\n    order: 3\n    children:\n      - path: automation\n        name: 自动化手册\n        collapsed: true\n');
  await generate({ ...options, fetchImpl: async () => response() });
  const config = parse(await readFile(options.categoryFile, 'utf8'));
  assert.equal(config.categories.length, 1);
  assert.equal(config.categories[0].name, '全局工程别名');
  assert.equal(config.categories[0].order, 3);
  assert.equal(config.categories[0].children.length, 1);
  assert.equal(config.categories[0].children[0].name, '自动化手册');
  assert.equal(config.categories[0].children[0].collapsed, true);
});
test('全局配置隐藏目标分类时，在请求 API 之前拒绝生成', async t => {
  const options = await setup(t);
  await writeFile(options.categoryFile, 'categories:\n  - path: engineering\n    hidden: true\n');
  await assert.rejects(generate({ ...options, fetchImpl: async () => { throw new Error('不应请求 API'); } }), /目标分类被设置为 hidden/);
});
