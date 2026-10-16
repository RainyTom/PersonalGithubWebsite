import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import safeMarkdown from './scripts/safe-markdown.js';
import { siteBase } from './scripts/site-paths.js';
import { codeThemes } from './scripts/code-themes.js';

// Actions 自动从仓库推导地址；也支持 SITE_URL / BASE_PATH 自定义覆盖。
const [owner] = (process.env.GITHUB_REPOSITORY || '').split('/');
const base = siteBase();
export default defineConfig({
  site: process.env.SITE_URL || (owner ? `https://${owner.toLowerCase()}.github.io` : 'https://rainytom.github.io'),
  base,
  trailingSlash: 'always',
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    processor: unified({ remarkPlugins: [safeMarkdown] }),
    shikiConfig: { themes: codeThemes },
  },
});
