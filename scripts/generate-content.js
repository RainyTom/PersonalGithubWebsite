import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from './frontmatter.js';
import { topics, prompts } from '../content-library/topics.js';

export function dateInTimezone(now = new Date(), timezone = 'Asia/Shanghai') {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type) => parts.find(p => p.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function validateArticle(value) {
  if (!value || typeof value !== 'object') throw new Error('文章不是 JSON 对象');
  for (const [key, min, max] of [['title', 1, 120], ['summary', 1, 300], ['body', 200, 20000]]) {
    if (typeof value[key] !== 'string' || value[key].trim().length < min || value[key].length > max) throw new Error(`文章字段 ${key} 长度不合规`);
  }
  if (!Array.isArray(value.tags) || !value.tags.length || value.tags.length > 5 || value.tags.some(tag => typeof tag !== 'string' || !tag.trim() || tag.length > 30)) throw new Error('文章标签不合规');
  if (/^---\s*$/m.test(value.body)) throw new Error('正文不能包含 frontmatter 分隔符，请用 Markdown 标题分隔段落');
  return { title: value.title.trim(), summary: value.summary.trim(), tags: [...new Set(value.tags.map(tag => tag.trim()))], body: value.body.trim() };
}

async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const lists = await Promise.all(entries.map(entry => entry.isDirectory() ? markdownFiles(path.join(dir, entry.name)) : entry.name.endsWith('.md') ? [path.join(dir, entry.name)] : []));
  return lists.flat();
}

export async function requestArticle(topic, date, env = process.env, fetchImpl = fetch) {
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) throw new Error('openai 模式必须设置 OPENAI_API_KEY 和 OPENAI_MODEL');
  const base = new URL(env.OPENAI_BASE_URL || 'https://api.openai.com/v1');
  if (base.protocol !== 'https:' || base.username || base.password || base.search || base.hash) throw new Error('OPENAI_BASE_URL 必须是无凭据、无查询参数的 HTTPS URL');
  const endpoint = `${base.href.replace(/\/$/, '')}/chat/completions`;
  const response = await fetchImpl(endpoint, {
    method: 'POST',
    redirect: 'error',
    signal: AbortSignal.timeout(90000),
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: env.OPENAI_MODEL,
      messages: [
        { role: 'system', content: '你是中文博客编辑。返回 JSON 对象，包含 title（不超过120字）、summary（不超过180字）、tags（1到5个短标签）、body（600到1200字的Markdown正文，无frontmatter，不使用独立的---分隔线）。写具体、实用、有边界的技术/生活/随笔。不编造亲身经历、引文、统计、来源链接或实时新闻，不提供医疗、投资或法律建议。不要输出原始HTML。' },
        { role: 'user', content: `日期：${date}。主题：${topic.title}；领域：${topic.tags.join('、')}。围绕主题写一篇独立完整的文章，给出可尝试的小例子。请返回 JSON。` },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 4000,
    }),
  });
  // 不记录响应原文，避免服务端错误回显凭据或请求内容。
  if (!response.ok) throw new Error(`内容 API HTTP ${response.status}；请检查额度、模型和兼容接口配置`);
  const result = await response.json();
  const choice = result.choices?.[0];
  if (choice?.finish_reason !== 'stop' || typeof choice.message?.content !== 'string') throw new Error('API 未返回完整文章');
  return validateArticle(JSON.parse(choice.message.content));
}

export async function generate({ dir = path.resolve('src/content/posts'), now = new Date(), env = process.env, fetchImpl = fetch } = {}) {
  const date = dateInTimezone(now, env.CONTENT_TIMEZONE || 'Asia/Shanghai');
  await mkdir(dir, { recursive: true });
  for (const file of await markdownFiles(dir)) {
    const { data } = matter(await readFile(file, 'utf8'));
    const existingDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date || '');
    if (existingDate === date && data.draft !== true) return { created: false, date, reason: '当天已有文章' };
  }
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  const topic = topics[day % topics.length];
  const mode = env.CONTENT_MODE || 'library';
  if (!['library', 'openai'].includes(mode)) throw new Error('CONTENT_MODE 仅支持 library 或 openai');
  const article = mode === 'openai' ? await requestArticle(topic, date, env, fetchImpl) : validateArticle({
    ...topic,
    title: `${topic.title} · ${date}`,
    body: `${topic.body}\n\n## 今天的小练习 · ${date}\n\n${prompts[Math.floor(day / topics.length) % prompts.length]}\n\n> 本文来自本地主题库，按日期轮换；主题和提示会循环。它是一份练习邀请，不是作者的亲身经历记录。`,
  });
  const frontmatter = { title: article.title, date, tags: article.tags, summary: article.summary, source: mode };
  // JSON 字符串也是合法 YAML 标量，能安全处理冒号、引号、换行等字符。
  const markdown = `---\n${Object.entries(frontmatter).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join('\n')}\n---\n\n${article.body}\n`;
  const file = path.join(dir, `${date}-daily.md`);
  try {
    // wx 不覆盖既有文件；Actions 的并发锁串行化生成、提交、部署全过程。
    await writeFile(file, markdown, { flag: 'wx' });
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error(`目标文件已存在但未识别为当天文章：${path.basename(file)}；请检查日期或草稿状态`);
    throw error;
  }
  return { created: true, date, file, source: mode };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  generate().then(result => console.log(JSON.stringify(result))).catch(error => {
    // 仅显示已知配置错误；网络错误也不输出 headers、URL 或响应原文。
    console.error(`内容生成失败：${error instanceof SyntaxError ? 'JSON 无法解析' : error.message}`);
    process.exitCode = 1;
  });
}
