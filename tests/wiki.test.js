import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, stat, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildWiki, routeFor } from '../scripts/wiki.js';
import { updateSidebar } from '../scripts/update-sidebar.js';

async function temp(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'wiki-navigation-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'wiki'), { recursive: true });
  return root;
}
async function put(root, file, content) { const target = path.join(root, file); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, content); }
const article = (title, extra = '') => `---\ntitle: ${title}\ndate: "2026-10-16"\ntags: [测试]\n${extra}---\n# ${title}\n\n正文`;
test('层级文件夹：分类/文章排序、中文别名、索引链接和面包屑', async t => {
  const root = await temp(t);
  await put(root, 'wiki/.category.config.yaml', 'name: 知识目录\n');
  await put(root, 'wiki/z/.category.config.yaml', 'name: 优先分类\norder: 1\ncollapsed: true\n');
  await put(root, 'wiki/z/index.md', article('分类总览'));
  await put(root, 'wiki/z/a.md', article('稍后阅读', 'order: 20\n'));
  await put(root, 'wiki/z/nested/.category.config.yaml', 'name: 嵌套别名\norder: 10\n');
  await put(root, 'wiki/z/nested/b.md', article('深层文章'));
  await put(root, 'wiki/a/x.md', article('另一分类'));
  const result = await buildWiki(root);
  const wiki = result.sidebar[1];
  assert.equal(wiki.text, '知识目录');
  assert.equal(wiki.items[0].text, '优先分类');
  assert.equal(wiki.items[0].collapsed, true);
  assert.equal(wiki.items[0].link, '/wiki/z/');
  assert.equal(wiki.items[0].items[0].text, '嵌套别名');
  const page = result.pages.find(p => p.title === '深层文章');
  assert.equal(page.breadcrumbs[1].text, '优先分类');
  assert.equal(page.breadcrumbs[1].url, '/wiki/z/');
  assert.equal(page.url, '/wiki/z/nested/b.html');
});
test('空目录不显示；hidden 和草稿从构建与检索数据排除', async t => {
  const root = await temp(t);
  await mkdir(path.join(root, 'wiki/empty'));
  await put(root, 'wiki/hidden/.category.config.yaml', 'name: 隐藏\nhidden: true\n');
  await put(root, 'wiki/hidden/a.md', article('不可发布'));
  await put(root, 'wiki/draft.md', article('草稿', 'draft: true\n'));
  const result = await buildWiki(root);
  assert.equal(result.pages.length, 0);
  assert.equal(result.categories.length, 0);
  assert.equal(result.sidebar.length, 2);
  assert.deepEqual(result.excluded.sort(), ['wiki/draft.md', 'wiki/hidden/**']);
});
test('别名变更、文件移动自动重建；相同输入不改写生成文件', async t => {
  const root = await temp(t);
  await put(root, 'wiki/foo/a.md', article('条目'));
  await updateSidebar(root);
  const generated = path.join(root, '.vitepress/generated/sidebar.json');
  const before = await stat(generated);
  await updateSidebar(root);
  assert.equal((await stat(generated)).mtimeMs, before.mtimeMs);
  await put(root, 'wiki/foo/.category.config.yaml', 'name: 修改后别名\n');
  await updateSidebar(root);
  assert.match(await readFile(generated, 'utf8'), /修改后别名/);
  await put(root, 'wiki/bar/b.md', article('新位置'));
  await rm(path.join(root, 'wiki/foo/a.md'));
  const result = await updateSidebar(root);
  assert.equal(result.pages.length, 1);
  assert.equal(result.pages[0].url, '/wiki/bar/b.html');
});
test('拼错配置、非法日期和非数字顺序会明确失败', async t => {
  const root = await temp(t);
  await put(root, 'wiki/foo/a.md', article('文章'));
  await put(root, 'wiki/foo/.category.config.yaml', 'collapse: true\n');
  await assert.rejects(buildWiki(root), /category.config.yaml 无效/);
  await put(root, 'wiki/foo/.category.config.yaml', 'name: 正常\n');
  await put(root, 'wiki/foo/a.md', '---\ntitle: 错误\ndate: "2026-02-30"\n---\n');
  await assert.rejects(buildWiki(root), /date 必须/);
  await put(root, 'wiki/foo/a.md', article('文章', 'order: "first"\n'));
  await assert.rejects(buildWiki(root), /order 必须/);
});
test('首页与 index.md URL 转换稳定', () => {
  assert.equal(routeFor('index.md'), '/');
  assert.equal(routeFor('wiki/foo/index.md'), '/wiki/foo/');
  assert.equal(routeFor('wiki/foo/bar.md'), '/wiki/foo/bar.html');
});
test('全局配置在文件夹完全不存在时仍显示多层空分类，且不伪造文章链接', async t => {
  const root = await temp(t);
  await rm(path.join(root, 'wiki'), { recursive: true });
  const categoryFile = path.join(root, 'category.config.yaml');
  await put(root, 'category.config.yaml', 'name: 全局知识目录\ncategories:\n  - path: data\n    name: 数据平台\n    order: 1\n    children:\n      - path: catalog\n        name: 元数据与 Catalog\n        collapsed: true\n');
  const result = await updateSidebar(root, { categoryFile });
  assert.equal(result.sidebar[1].text, '全局知识目录');
  assert.equal(result.sidebar[1].items[0].text, '数据平台');
  assert.equal(result.sidebar[1].items[0].items[0].text, '元数据与 Catalog');
  assert.equal(result.sidebar[1].items[0].items[0].link, undefined);
  assert.equal(result.pages.length, 0);
  assert.equal(result.categories.length, 2);
  await assert.rejects(stat(path.join(root, 'wiki')), { code: 'ENOENT' });
});
test('全局分类与实际文件夹合并，别名优先于旧配置，隐藏虚拟分类不显示', async t => {
  const root = await temp(t);
  const categoryFile = path.join(root, 'category.config.yaml');
  await put(root, 'category.config.yaml', 'categories:\n  - path: actual\n    name: 全局别名\n    order: 1\n  - path: empty\n    name: 空分类\n    order: 2\n  - path: hidden\n    hidden: true\n');
  await put(root, 'wiki/actual/.category.config.yaml', 'name: 旧别名\n');
  await put(root, 'wiki/actual/a.md', article('真实文章'));
  await put(root, 'wiki/unconfigured/a.md', article('自动发现'));
  const result = await buildWiki(root, { categoryFile });
  assert.deepEqual(result.sidebar[1].items.map(item => item.text), ['全局别名', '空分类', 'unconfigured']);
  assert.equal(result.pages.find(item => item.title === '真实文章').breadcrumbs[1].text, '全局别名');
  assert.ok(result.excluded.includes('wiki/hidden/**'));
});
test('全局分类拒绝重复路径、路径穿越和无效字段', async t => {
  const root = await temp(t);
  const categoryFile = path.join(root, 'category.config.yaml');
  for (const content of ['categories: [{path: ../outside}]', 'categories: [{path: a}, {path: a}]', 'categories: [{path: a, collapse: true}]']) {
    await put(root, 'category.config.yaml', content);
    await assert.rejects(buildWiki(root, { categoryFile }), /category.config.yaml 无效/);
  }
});
