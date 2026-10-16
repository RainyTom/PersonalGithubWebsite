import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import safeMarkdown from './scripts/safe-markdown.js';

// Actions 自动从仓库推导地址；也支持 SITE_URL / BASE_PATH 自定义覆盖。
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
const isUserSite = repo?.toLowerCase() === `${owner?.toLowerCase()}.github.io`;
const base = process.env.BASE_PATH ?? (repo && !isUserSite ? `/${repo}` : '/');
export default defineConfig({
  site: process.env.SITE_URL || (owner ? `https://${owner.toLowerCase()}.github.io` : 'https://rainytom.github.io'),
  base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    processor: unified({ remarkPlugins: [safeMarkdown] }),
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
});
