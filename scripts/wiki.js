import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import frontmatter from './frontmatter.js';

const compare = (a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.text.localeCompare(b.text, 'zh-CN', { numeric: true }) || a.key.localeCompare(b.key);
export const routeFor = (relative) => {
  const stem = relative.replace(/\.md$/, '');
  if (stem === 'index') return '/';
  return `/${stem.endsWith('/index') ? stem.slice(0, -5) : `${stem}.html`}`;
};
export async function categoryConfig(dir) {
  let raw;
  try { raw = await readFile(path.join(dir, '.category.config.yaml'), 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
  const data = parse(raw, { maxAliasCount: 20, uniqueKeys: true });
  const fail = () => { throw new Error(`${dir}/.category.config.yaml 无效：支持 name(非空字符串)、order(有限数字)、collapsed/hidden(布尔值)`); };
  if (!data || typeof data !== 'object' || Array.isArray(data)) fail();
  for (const key of Object.keys(data)) if (!['name', 'order', 'collapsed', 'hidden'].includes(key)) fail();
  if (data.name !== undefined && (typeof data.name !== 'string' || !data.name.trim())) fail();
  if (data.order !== undefined && (typeof data.order !== 'number' || !Number.isFinite(data.order))) fail();
  for (const key of ['collapsed', 'hidden']) if (data[key] !== undefined && typeof data[key] !== 'boolean') fail();
  return data;
}
// 单个全局文件定义整个知识目录；声明不依赖磁盘文件夹是否存在。
export async function loadGlobalCategories(root, categoryFile = path.resolve(root, '../category.config.yaml')) {
  let raw;
  try { raw = await readFile(categoryFile, 'utf8'); }
  catch (error) { if (error.code === 'ENOENT') return { config: null, byPath: new Map(), categoryFile }; throw error; }
  const config = parse(raw, { maxAliasCount: 20, uniqueKeys: true });
  const fail = message => { throw new Error(`category.config.yaml 无效：${message}`); };
  if (!config || typeof config !== 'object' || Array.isArray(config) || !Array.isArray(config.categories)) fail('需要 categories 数组');
  for (const key of Object.keys(config)) if (!['name', 'categories'].includes(key)) fail(`未知字段 ${key}`);
  if (config.name !== undefined && (typeof config.name !== 'string' || !config.name.trim())) fail('name 必须是非空字符串');
  const byPath = new Map([['wiki', { name: config.name || '知识目录', collapsed: false }]]);
  function visit(items, parent) {
    const seen = new Set();
    for (const item of items) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) fail('分类必须是对象');
      for (const key of Object.keys(item)) if (!['path', 'name', 'order', 'collapsed', 'hidden', 'children'].includes(key)) fail(`未知分类字段 ${key}`);
      if (typeof item.path !== 'string' || !/^[a-zA-Z0-9_\u3400-\u9fff-]+$/.test(item.path)) fail('path 必须是单层文件夹名称，不能包含斜杠或 ..');
      if (seen.has(item.path)) fail(`重复路径 ${parent}/${item.path}`);
      seen.add(item.path);
      if (item.name !== undefined && (typeof item.name !== 'string' || !item.name.trim())) fail('分类 name 必须是非空字符串');
      if (item.order !== undefined && (typeof item.order !== 'number' || !Number.isFinite(item.order))) fail('order 必须是有限数字');
      for (const key of ['hidden', 'collapsed']) if (item[key] !== undefined && typeof item[key] !== 'boolean') fail(`${key} 必须是布尔值`);
      if (item.children !== undefined && !Array.isArray(item.children)) fail('children 必须是数组');
      const { path: segment, children, ...properties } = item;
      const relative = `${parent}/${segment}`;
      byPath.set(relative, properties);
      visit(children || [], relative);
    }
  }
  visit(config.categories, 'wiki');
  return { config, byPath, categoryFile };
}
export async function registerGlobalCategories(root, topic, categoryFile) {
  const global = await loadGlobalCategories(root, categoryFile);
  const config = global.config || { name: '知识目录', categories: [] };
  let items = config.categories, dir = path.join(root, 'wiki');
  for (const [i, segment] of topic.path.split('/').entries()) {
    dir = path.join(dir, segment);
    let item = items.find(item => item.path === segment);
    if (!item) {
      const legacy = await categoryConfig(dir);
      item = { path: segment, name: legacy.name || topic.categories[i], collapsed: legacy.collapsed ?? false, ...(legacy.order !== undefined ? { order: legacy.order } : {}) };
      items.push(item);
    }
    if (i < topic.path.split('/').length - 1) { item.children ??= []; items = item.children; }
  }
  await writeIfChanged(global.categoryFile, stringify(config));
}
export async function writeIfChanged(file, text) {
  try { if (await readFile(file, 'utf8') === text) return false; }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
  return true;
}
export async function buildWiki(root = path.resolve('docs'), { categoryFile } = {}) {
  const pages = [], excluded = [], categories = [];
  const global = await loadGlobalCategories(root, categoryFile);
  function cleanNode(node) { const { order, key, isIndex, ...item } = node; return item; }
  async function walk(dir, crumbs = []) {
    let entries;
    try { entries = await readdir(dir, { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') entries = []; else throw error; }
    const parent = path.relative(root, dir).split(path.sep).join('/');
    for (const relative of global.byPath.keys()) {
      if (path.posix.dirname(relative) !== (parent || '.')) continue;
      const name = path.posix.basename(relative);
      const existing = entries.find(entry => entry.name === name);
      if (existing && !existing.isDirectory()) throw new Error(`分类路径与文件冲突：${relative}`);
      if (!existing) entries.push({ name, isDirectory: () => true, isFile: () => false, isSymbolicLink: () => false });
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    const nodes = [];
    for (const entry of entries) {
      if (entry.name.startsWith('.') || (dir === root && entry.name === 'public')) continue;
      const absolute = path.join(dir, entry.name);
      const relative = path.relative(root, absolute).split(path.sep).join('/');
      if (entry.isSymbolicLink()) throw new Error(`不支持符号链接：${relative}`);
      if (entry.isDirectory()) {
        const config = { ...await categoryConfig(absolute), ...global.byPath.get(relative) };
        if (config.hidden) { excluded.push(`${relative}/**`); continue; }
        const text = config.name?.trim() || entry.name;
        const children = await walk(absolute, [...crumbs, { text, path: relative }]);
        if (!children.length && !global.byPath.has(relative)) continue;
        const index = children.find(node => node.isIndex);
        const rest = children.filter(node => !node.isIndex);
        nodes.push({ text, ...(index ? { link: index.link } : {}), ...(rest.length ? { collapsed: config.collapsed ?? false, items: rest.map(cleanNode) } : {}), order: config.order, key: relative });
        if (relative.startsWith('wiki/')) categories.push({ name: text, path: relative });
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const raw = await readFile(absolute, 'utf8');
        const { data, content } = /^(\uFEFF)?---/.test(raw) ? frontmatter(raw) : { data: {}, content: raw };
        if (data.draft === true) { excluded.push(relative); continue; }
        const title = data.title || /^#\s+(.+)$/m.exec(content)?.[1] || entry.name.replace(/\.md$/, '');
        if (typeof title !== 'string' || !title.trim()) throw new Error(`${relative}: title 必须是字符串`);
        if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.some(tag => typeof tag !== 'string' || !tag.trim()))) throw new Error(`${relative}: tags 必须是非空字符串数组`);
        if (data.order !== undefined && (typeof data.order !== 'number' || !Number.isFinite(data.order))) throw new Error(`${relative}: order 必须是有限数字`);
        if (data.date !== undefined && (typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !Number.isFinite(Date.parse(`${data.date}T00:00:00Z`)) || new Date(`${data.date}T00:00:00Z`).toISOString().slice(0, 10) !== data.date)) throw new Error(`${relative}: date 必须是加引号的合法 YYYY-MM-DD`);
        const link = routeFor(relative);
        pages.push({ title: title.trim(), relativePath: relative, url: link, summary: String(data.summary || data.description || ''), date: data.date || '', tags: [...new Set(data.tags || [])], source: String(data.source || 'manual'), kind: relative.startsWith('wiki/') ? 'entry' : 'system', breadcrumbs: crumbs.map(crumb => ({ ...crumb })) });
        nodes.push({ text: title.trim(), link, order: data.order, key: relative, isIndex: entry.name === 'index.md' });
      }
    }
    return nodes.sort(compare);
  }
  const tree = await walk(root);
  const wiki = tree.find(node => node.key === 'wiki');
  const sidebar = [
    { text: '工作区', items: [{ text: '知识库概览', link: '/' }, { text: '归档', link: '/archive.html' }, { text: '标签', link: '/tags.html' }] },
    ...(wiki ? [cleanNode(wiki)] : []),
    { text: '维护指南', collapsed: false, items: [{ text: '内容组织', link: '/authoring.html' }, { text: '排版参考', link: '/reference.html' }] },
  ];
  for (const page of pages) for (const crumb of page.breadcrumbs) {
    const index = pages.find(item => item.relativePath === `${crumb.path}/index.md`);
    if (index) crumb.url = index.url;
  }
  pages.sort((a, b) => b.date.localeCompare(a.date) || a.relativePath.localeCompare(b.relativePath));
  categories.sort((a, b) => a.path.localeCompare(b.path));
  return { sidebar, pages, categories, excluded };
}
