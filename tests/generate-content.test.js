import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import matter from '../scripts/frontmatter.js';
import { dateInTimezone, generate, requestArticle } from '../scripts/generate-content.js';

async function temp(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'everyday-notes-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
test('北京时间跨日时切换日期，不受 runner 时区影响', () => {
  assert.equal(dateInTimezone(new Date('2026-10-15T15:59:59Z')), '2026-10-15');
  assert.equal(dateInTimezone(new Date('2026-10-15T16:00:00Z')), '2026-10-16');
});
test('同一天重复检查不写文件，下一天生成新文章', async t => {
  const dir = await temp(t);
  const options = { dir, now: new Date('2026-10-16T04:00:00Z'), env: { CONTENT_MODE: 'library' } };
  const first = await generate(options);
  const before = await readFile(first.file, 'utf8');
  assert.equal(first.created, true);
  assert.equal((await generate(options)).created, false);
  assert.equal(await readFile(first.file, 'utf8'), before);
  assert.equal(matter(before).data.date, '2026-10-16');
  await generate({ ...options, now: new Date('2026-10-17T04:00:00Z') });
  assert.equal((await readdir(dir)).length, 2);
});
test('手动发布的当天文章也会阻止自动重复生成；草稿不会', async t => {
  const dir = await temp(t);
  const options = { dir, now: new Date('2026-10-16T04:00:00Z'), env: {} };
  await writeFile(path.join(dir, 'manual.md'), '---\ndate: 2026-10-16\ndraft: true\n---\nDraft');
  assert.equal((await generate(options)).created, true);
  const other = await temp(t);
  await writeFile(path.join(other, 'manual.md'), '---\ndate: "2026-10-16"\n---\nPublished');
  assert.equal((await generate({ ...options, dir: other })).created, false);
});
test('API 出错或 JSON 无效时不写入文章，也不回显响应内容', async t => {
  const dir = await temp(t);
  const env = { CONTENT_MODE: 'openai', OPENAI_API_KEY: 'test-only', OPENAI_MODEL: 'test-model' };
  await assert.rejects(generate({ dir, env, fetchImpl: async () => new Response('secret-error-body', { status: 429 }) }), /HTTP 429/);
  assert.deepEqual(await readdir(dir), []);
  await assert.rejects(requestArticle({ title: 'test', tags: ['test'] }, '2026-10-16', env, async () => Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"title":"empty"}' } }] })), /字段/);
});
test('API 正常 JSON 可解析，标题含冒号/换行也不破坏 frontmatter', async t => {
  const dir = await temp(t);
  const article = { title: '标题: "例子"\n第二行', summary: '一个摘要', tags: ['技术'], body: '这是一篇用于验证正确响应的文章。'.repeat(30) };
  const result = await generate({ dir, env: { CONTENT_MODE: 'openai', OPENAI_API_KEY: 'test-only', OPENAI_MODEL: 'test-model' }, fetchImpl: async (url, init) => {
    assert.equal(url, 'https://api.openai.com/v1/chat/completions');
    assert.equal(JSON.parse(init.body).response_format.type, 'json_object');
    return Response.json({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(article) } }] });
  } });
  assert.equal(matter(await readFile(result.file, 'utf8')).data.title, article.title);
});
