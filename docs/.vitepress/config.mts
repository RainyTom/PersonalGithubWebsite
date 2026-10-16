import { defineConfig } from 'vitepress';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { rssFeed } from '../../scripts/feed.js';
import sidebar from './generated/sidebar.json' with { type: 'json' };
import catalog from './generated/catalog.json' with { type: 'json' };
import excluded from './generated/excluded.json' with { type: 'json' };

const [owner, repo] = (process.env.GITHUB_REPOSITORY || 'RainyTom/PersonalGithubWebsite').split('/');
const base = process.env.BASE_PATH ?? (process.env.GITHUB_ACTIONS && repo.toLowerCase() !== `${owner.toLowerCase()}.github.io` ? `/${repo}/` : '/');
const origin = process.env.SITE_URL || `https://${owner.toLowerCase()}.github.io`;
const absolute = (url: string) => new URL(`${base.replace(/\/$/, '')}${url}`, origin).href;

export default defineConfig({
  lang: 'zh-CN', title: 'RainyTom / Wiki', description: '结构化记录、连接知识、持续维护。',
  base, cleanUrls: false, lastUpdated: true, srcExclude: excluded,
  sitemap: { hostname: `${origin}${base}` },
  head: [
    ['link', { rel: 'icon', href: `${base}favicon.svg`, type: 'image/svg+xml' }],
    ['link', { rel: 'alternate', href: `${base}rss.xml`, type: 'application/rss+xml', title: 'RainyTom Wiki' }],
  ],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [{ text: '首页', link: '/' }, { text: '归档', link: '/archive.html' }, { text: '标签', link: '/tags.html' }],
    sidebar,
    outline: { level: [2, 4], label: '本页大纲' },
    search: {
      provider: 'local',
      options: {
        // Intl 分词 + 中文二字切分，同时用于构建索引和浏览器查询。
        miniSearch: {
          options: {
            tokenize(text: string) {
              const words = [...new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text.toLowerCase())].filter(item => item.isWordLike).map(item => item.segment);
              const han = text.match(/[\u3400-\u9fff]+/g) || [];
              return [...new Set([...words, ...han.flatMap(word => word.length === 1 ? [word] : Array.from({ length: word.length - 1 }, (_, i) => word.slice(i, i + 2)))])];
            },
          },
          searchOptions: { prefix: true, fuzzy: 0.2 },
        },
        translations: {
          button: { buttonText: '搜索知识库', buttonAriaLabel: '搜索知识库' },
          modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清空搜索', displayDetails: '显示详细结果', footer: { selectText: '打开', navigateText: '切换', closeText: '关闭' } },
        },
      },
    },
    socialLinks: [{ icon: 'github', link: `https://github.com/${owner}/${repo}` }],
    editLink: { pattern: `https://github.com/${owner}/${repo}/edit/main/docs/:path`, text: '在 GitHub 编辑此页' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新', formatOptions: { dateStyle: 'medium' } },
    sidebarMenuLabel: '目录', returnToTopLabel: '返回顶部', darkModeSwitchLabel: '切换主题',
    footer: { message: `<a href="${base}rss.xml">RSS 订阅</a> · 结构化记录，持续维护。`, copyright: 'RainyTom · Knowledge Workspace' },
  },
  markdown: {
    lineNumbers: true, image: { lazyLoad: true },
    config(md) {
      const fence = md.renderer.rules.fence!;
      // 避免额外 Mermaid 主题插件耦合；正文进入客户端懒加载组件。
      md.renderer.rules.fence = (tokens, index, options, env, self) => {
        if (tokens[index].info.trim() === 'mermaid') {
          return `<MermaidDiagram :code="${md.utils.escapeHtml(JSON.stringify(tokens[index].content))}" />`;
        }
        return fence(tokens, index, options, env, self);
      };
    },
  },
  transformPageData(page) {
    const item = catalog.pages.find(item => item.relativePath === page.relativePath);
    if (page.frontmatter.summary) page.description = page.frontmatter.summary;
    const url = item?.url || `/${page.relativePath.replace(/\.md$/, '.html')}`;
    page.frontmatter.head ??= [];
    page.frontmatter.head.push(
      ['link', { rel: 'canonical', href: absolute(url) }],
      ['meta', { property: 'og:title', content: `${page.title} | RainyTom Wiki` }],
      ['meta', { property: 'og:description', content: page.description || '结构化记录、连接知识、持续维护。' }],
      ['meta', { property: 'og:type', content: item?.kind === 'entry' ? 'article' : 'website' }],
      ['meta', { property: 'og:url', content: absolute(url) }],
    );
  },
  async buildEnd(config) {
    await writeFile(join(config.outDir, 'rss.xml'), rssFeed(catalog.pages, origin, base));
    await writeFile(join(config.outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absolute('/sitemap.xml')}\n`);
  },
});
