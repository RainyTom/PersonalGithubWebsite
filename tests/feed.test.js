import test from 'node:test';
import assert from 'node:assert/strict';
import { rssFeed } from '../scripts/feed.js';
test('RSS 只包含知识条目，转义 XML，保留仓库子路径', () => {
  const output = rssFeed([
    { kind: 'system', title: '系统指南' },
    { kind: 'entry', title: 'A & B', summary: '<示例>', url: '/wiki/a.html', date: '2026-10-16', tags: ['C&D'] },
  ], 'https://rainytom.github.io', '/PersonalGithubWebsite/');
  assert.doesNotMatch(output, /系统指南/);
  assert.match(output, /A &amp; B/);
  assert.match(output, /&lt;示例&gt;/);
  assert.match(output, /https:\/\/rainytom.github.io\/PersonalGithubWebsite\/wiki\/a.html/);
  assert.match(output, /<pubDate>Thu, 15 Oct 2026 16:00:00 GMT<\/pubDate>/);
});
