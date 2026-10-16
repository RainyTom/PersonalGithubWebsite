import { mkdir, readdir, readFile, writeFile, link, rm, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';
import frontmatter from './frontmatter.js';
import { updateSidebar } from './update-sidebar.js';
import { buildWiki, categoryConfig, loadGlobalCategories, registerGlobalCategories } from './wiki.js';

export function dateInTimezone(now = new Date(), timezone = 'Asia/Shanghai') {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const value = type => parts.find(part => part.type === type).value;
  return `${value('year')}-${value('month')}-${value('day')}`;
}
export function validateTopics(config) {
  if (!Array.isArray(config?.topics) || !config.topics.length) throw new Error('topics.yaml 必须包含非空 topics 数组');
  const aliases = new Map();
  for (const topic of config.topics) {
    if (typeof topic.title !== 'string' || !topic.title.trim() || typeof topic.path !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(topic.path)) throw new Error('主题 title 或 path 不合法');
    const parts = topic.path.split('/');
    if (!Array.isArray(topic.categories) || topic.categories.length !== parts.length || topic.categories.some(item => typeof item !== 'string' || !item.trim())) throw new Error('categories 必须逐层对应 path');
    if (!Array.isArray(topic.tags) || !topic.tags.length || topic.tags.some(tag => typeof tag !== 'string' || !tag.trim())) throw new Error('主题 tags 必须是非空字符串数组');
    parts.forEach((_, i) => {
      const key = parts.slice(0, i + 1).join('/');
      if (aliases.has(key) && aliases.get(key) !== topic.categories[i]) throw new Error(`主题配置中 ${key} 别名冲突`);
      aliases.set(key, topic.categories[i]);
    });
  }
  return config.topics;
}
export function validateArticle(value) {
  if (!value || typeof value !== 'object') throw new Error('API 返回的文章不是 JSON 对象');
  for (const [key, min, max] of [['title', 1, 120], ['summary', 1, 300], ['body', 300, 24000]]) {
    if (typeof value[key] !== 'string' || value[key].trim().length < min || value[key].length > max) throw new Error(`文章字段 ${key} 长度不合规`);
  }
  if (!Array.isArray(value.tags) || !value.tags.length || value.tags.length > 6 || value.tags.some(tag => typeof tag !== 'string' || !tag.trim() || tag.length > 30)) throw new Error('文章标签不合规');
  // 技术文档至少提供一个对照表或 Mermaid 图；避免纯散文式填充。
  const table = /^\s*\|?.+\|.+\r?\n\s*\|?\s*:?-{3,}:?\s*\|/m.test(value.body);
  const diagram = /(^|\n)```mermaid\s*\n[\s\S]+?\n```/.test(value.body);
  if (!table && !diagram) throw new Error('文章必须包含 Markdown 表格或 Mermaid 图');
  if (/^---\s*$/m.test(value.body)) throw new Error('正文不能包含 frontmatter 分隔符');
  // VitePress 会编译 Markdown 中的 Vue 表达式，自动内容禁止组件和模板表达式。
  if (/<\/?[A-Za-z!][^>]*>|\{\{|\}\}/.test(value.body)) throw new Error('自动文章不得包含 HTML/Vue 标签或模板表达式');
  if (/\]\(\s*(?:javascript|data|vbscript):/i.test(value.body)) throw new Error('自动文章包含危险链接');
  return { title: value.title.trim(), summary: value.summary.trim(), tags: [...new Set(value.tags.map(tag => tag.trim()))], body: value.body.trim() };
}
async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = await Promise.all(entries.map(entry => {
    if (entry.name.startsWith('.')) return [];
    if (entry.isSymbolicLink()) throw new Error('知识目录不能包含符号链接');
    return entry.isDirectory() ? markdownFiles(path.join(dir, entry.name)) : entry.name.endsWith('.md') ? [path.join(dir, entry.name)] : [];
  }));
  return results.flat();
}
export async function requestArticle(topic, date, env = process.env, fetchImpl = fetch, recentTitles = []) {
  const base = new URL(env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error('OPENAI_BASE_URL 必须是无凭据和查询参数的 HTTPS 地址');
  const response = await fetchImpl(`${base.href.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(90000),
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: '你是技术知识库编辑。仅返回 JSON 对象，字段 title（120字内）、summary（180字内）、tags（1到6个短标签）、body（800到1600字Markdown）。正文包含一个一级标题、清晰的二级/三级标题、适用边界、可操作示例，且至少一个标准Markdown表格（分隔行至少3个短横线）或```mermaid图。禁止HTML、Vue组件、{{}}模板语法、frontmatter与独立---分隔线。不要编造引用、来源、版本特性、数据或个人经历。示例须声明条件。不写医疗/投资/法律建议。返回JSON。' },
        { role: 'user', content: `日期：${date}。主题：${topic.title}。标签方向：${topic.tags.join('、')}。近期已有标题：${recentTitles.join('；') || '无'}。选择一个具体切入点，避免重复，生成独立完整的参考条目。` },
      ],
      response_format: { type: 'json_object' }, max_completion_tokens: 6000,
    }),
  });
  if (!response.ok) throw new Error(`内容 API HTTP ${response.status}，请检查凭据、模型与额度`);
  const data = await response.json();
  const choice = data.choices?.[0];
  if (choice?.finish_reason !== 'stop' || typeof choice.message?.content !== 'string') throw new Error('API 未返回完整文章');
  return validateArticle(JSON.parse(choice.message.content));
}
export async function generate({ root = path.resolve('docs'), now = new Date(), env = process.env, fetchImpl = fetch, topicsFile = path.resolve('config/topics.yaml'), categoryFile = path.resolve(root, '../category.config.yaml') } = {}) {
  const date = dateInTimezone(now, env.CONTENT_TIMEZONE || 'Asia/Shanghai');
  const wiki = path.join(root, 'wiki');
  await mkdir(wiki, { recursive: true });
  const files = await markdownFiles(wiki);
  const entries = await Promise.all(files.map(async file => {
    const raw = await readFile(file, 'utf8');
    return /^(\uFEFF)?---/.test(raw) ? frontmatter(raw).data : {};
  }));
  if (entries.some(data => data.date === date && data.source === 'openai' && data.draft !== true)) return { created: false, date, reason: '当天已有 AI 文章' };
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) return { created: false, date, reason: '未配置 OPENAI_API_KEY / OPENAI_MODEL，跳过 AI 生成' };
  const topics = validateTopics(parse(await readFile(topicsFile, 'utf8'), { maxAliasCount: 20, uniqueKeys: true }));
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  const topic = topics[day % topics.length];
  await buildWiki(root, { categoryFile }); // 配置错误时先失败，避免浪费一次 API 请求。
  const global = await loadGlobalCategories(root, categoryFile);
  let categoryPath = wiki;
  for (const segment of ['', ...topic.path.split('/')]) {
    if (segment) categoryPath = path.join(categoryPath, segment);
    const relative = path.relative(root, categoryPath).split(path.sep).join('/');
    if (({ ...await categoryConfig(categoryPath), ...global.byPath.get(relative) }).hidden) throw new Error('目标分类被设置为 hidden，无法自动发布');
  }
  // 本地并发调用只会有一个进程获得生成锁；Actions 另有工作流级串行锁。
  const lock = path.join(wiki, '.generation.lock');
  try { await mkdir(lock); }
  catch (error) { if (error.code === 'EEXIST') throw new Error('另一个内容生成进程正在运行'); throw error; }
  try {
    const article = await requestArticle(topic, date, env, fetchImpl, entries.filter(item => item.title).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 14).map(item => item.title));
    if (entries.some(item => item.title === article.title)) throw new Error('生成标题与已有文章重复，拒绝发布');
    const front = { title: article.title, date, summary: article.summary, tags: article.tags, type: 'Reference', source: 'openai' };
    const markdown = `---\n${stringify(front)}---\n\n${article.body}\n`;
    const target = path.join(wiki, topic.path);
    // 暂存目录中的文件不被扫描；通过全部内容和目录校验后再生成分类。
    const staging = path.join(lock, 'article.md');
    await writeFile(staging, markdown);
    await mkdir(target, { recursive: true });
    const file = path.join(target, `${date}-daily.md`);
    // 不覆盖任何已有文件，包括同名草稿。
    try { await link(staging, file); }
    catch (error) { if (error.code === 'EEXIST') throw new Error('当天目标文件已存在，请检查日期、来源或草稿状态'); throw error; }
    await registerGlobalCategories(root, topic, categoryFile);
    await updateSidebar(root, { categoryFile });
    return { created: true, date, file, source: 'openai' };
  } finally { await rm(lock, { recursive: true, force: true }); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generate().then(async result => {
    console.log(JSON.stringify(result));
    if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `### 内容检查 · ${result.date}\n\n${result.created ? '已生成当天 AI 条目。' : result.reason}\n`);
    if (process.env.GITHUB_ACTIONS && result.reason?.startsWith('未配置')) console.log('::warning::未配置 AI 凭据；站点正常部署，每日 AI 更新尚未启动。');
  }).catch(error => { console.error(`内容生成失败：${error instanceof SyntaxError ? 'JSON 无法解析' : error.message}`); process.exitCode = 1; });
}
