# 日常之间 · 自动化博客

Astro 7 + 纯 CSS + Markdown + GitHub Pages + GitHub Actions。移动优先，最大内容宽度 920px，浅色/深色主题，中文排版，无外部字体或 UI 框架。正文静态输出，浏览器只运行主题切换脚本。

选择 Astro 是因为博客主要是内容阅读：可以在构建时生成完整 HTML，直接使用 Markdown 内容集合、Shiki 高亮、RSS 和 sitemap，无需数据库或常驻服务。纯 CSS 足够覆盖本项目的布局与主题需求。

本项目已提供完整源码。`npm run source` 将所有手写源文件汇总到 `artifacts/PROJECT-SOURCE.md`，方便一次查看和复制；`package-lock.json` 直接使用仓库版本，以 `npm ci` 复现依赖。`artifacts/`、`dist/`、`.env` 不提交。

## 目录结构

```text
.
├── .env.example
├── .gitignore
├── .github/workflows/publish.yml      # 每小时检查 + 内容提交 + Pages 部署
├── README.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── astro.config.mjs                   # 自动推导 site / base
├── content-library/topics.js          # 本地主题与每日练习
├── public/favicon.svg
├── scripts/
│   ├── export-source.js
│   ├── frontmatter.js
│   ├── generate-content.js
│   └── safe-markdown.js
├── tests/generate-content.test.js
└── src/
    ├── config.ts                     # 名称、描述、作者、GitHub 链接
    ├── content.config.ts             # frontmatter 校验
    ├── content/posts/
    │   ├── 2026-10-10-small-tools.md
    │   ├── 2026-10-11-reading-notes.md
    │   ├── 2026-10-12-static-site.md
    │   ├── 2026-10-13-walk.md
    │   ├── 2026-10-14-readable-code.md
    │   └── 2026-10-15-small-blog.md
    ├── components/
    │   ├── Listing.astro
    │   └── PostCard.astro
    ├── layouts/Base.astro
    ├── lib/posts.ts
    ├── styles/global.css
    └── pages/
        ├── index.astro
        ├── 404.astro
        ├── about.astro
        ├── robots.txt.ts
        ├── rss.xml.ts
        ├── page/[page].astro
        ├── posts/[...id].astro
        └── tags/
            ├── index.astro
            └── [tag].astro
```

之后自动新增 `src/content/posts/YYYY-MM-DD-daily.md`。构建输出到 `dist/`，包括所有文章、标签、分页、`rss.xml`、`sitemap-index.xml`、`sitemap-0.xml`、`robots.txt` 和 `404.html`。

## 本地运行

需要 Node.js 24+、npm、Git 和 GitHub CLI。安装依赖之后，使用已提交的锁文件。

```bash
npm ci
npm run dev
# 打开终端显示的本地地址，一般为 http://localhost:4321/
```

```bash
npm test
npm run check
npm run build
npm run preview
```

测试 GitHub 项目子路径：

```bash
GITHUB_REPOSITORY=RainyTom/PersonalGithubWebsite npm run build
GITHUB_REPOSITORY=RainyTom/PersonalGithubWebsite npm run preview
# http://localhost:4321/PersonalGithubWebsite/
```

`src/config.ts` 和 `src/pages/about.astro` 是个人信息入口。初始的 6 篇文章是本项目的示例内容，`source: manual` 表示静态维护的文章，与自动发布来源区分；请按个人情况编辑，并勿将示例当作个人经历。首页每页 5 篇，第二页开始使用 `/page/2/`。内容不足 6 篇时不会显示分页。

## 从零创建仓库并启用 Pages

以下命令使用 Bash/Zsh。`OWNER` 自动取当前登录账号；把 `REPO` 改成你实际想用的仓库名，无需输入尖括号。这里的默认值是 `PersonalGithubWebsite`，创建后公开可见。个人主页仓库可改成 `你的用户名.github.io`，项目会自动使用根路径。

1. 登录并确认账号；设备登录过程中需要手动在浏览器授权，不要把 Token 发到聊天或写入仓库。

```bash
gh auth login --hostname github.com --git-protocol https --web
gh auth status
gh auth setup-git
OWNER=$(gh api user --jq .login)
REPO=PersonalGithubWebsite
```

2. 本地初始化、校验并首次提交。已经是 Git 仓库时不要重新创建或覆盖 origin；先查看 `git remote -v`。如 Git 提示缺少作者信息，请使用你自己的姓名和 GitHub 隐私邮箱设置 `git config user.name` / `git config user.email`。

```bash
git init -b main
npm ci
npm test
npm run check
npm run build
git add .
git commit -m "feat: create automated Astro blog"
gh repo create "$REPO" --public --source=. --remote=origin --push
```

3. 把 Pages 发布来源设为 GitHub Actions。新站用 POST，已启用 Pages 的仓库用 PUT；不要把鉴权或权限错误当成“已存在”。首次 push 可能在启用 Pages 之前启动工作流，配置完成后手动再运行即可。

```bash
# 新站：build_type=workflow 即 GitHub Actions 发布来源
gh api --method POST "repos/$OWNER/$REPO/pages" -f build_type=workflow

# 仅当上一步提示 Pages 已存在时，运行下面这条修改命令：
# gh api --method PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow

# 确认输出 build_type 为 workflow
gh api "repos/$OWNER/$REPO/pages" --jq '{url: .html_url, build_type: .build_type}'
```

4. 默认本地库模式无需 Secret。可显式设置模式，并手动触发。

```bash
gh variable set CONTENT_MODE --body library --repo "$OWNER/$REPO"
gh workflow run publish.yml --ref main --repo "$OWNER/$REPO"
gh run list --workflow publish.yml --limit 5 --repo "$OWNER/$REPO"

# 找到本次手动运行，而不是可能尚在运行的首次 push 任务。
RUN_ID=$(gh run list --workflow publish.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId' --repo "$OWNER/$REPO")
gh run watch "$RUN_ID" --exit-status --repo "$OWNER/$REPO"
gh api "repos/$OWNER/$REPO/pages" --jq .html_url
```

5. 验证部署后的地址。GitHub Pages CDN 首次生效可能需要稍等。项目仓库网址通常为 `https://你的用户名.github.io/你的仓库名/`；用户名仓库网址为 `https://你的用户名.github.io/`。

```bash
gh browse --repo "$OWNER/$REPO"
gh run view "$RUN_ID" --log-failed --repo "$OWNER/$REPO"
gh api "repos/$OWNER/$REPO/commits?per_page=5" --jq '.[].commit.message'
git pull --ff-only
```

`gh browse` 打开仓库，网站地址以上一步 Pages API 为准。机器人提交可能已领先本地，编辑之前先 `git pull --ff-only`。

## 可选：启用 OpenAI / 兼容 API

默认的本地库没有 API 费用，内容是技术、生活、随笔三个领域的 6 个主题和 7 个练习提示组合，主题会循环，不是每天全新写作。若希望每天生成独立新稿，可以改用 API；无法保证模型完全不重复或事实绝对准确。

你需要手动获取自己的 API Key、确认账户额度，并选择该账号可调用的模型。此处不预设模型 ID，避免用不可用模型产生失败或意外费用。接口必须支持 Chat Completions、`response_format: json_object` 和 `max_completion_tokens`。JSON 模式仅保证语法，脚本还会校验字段、长度和完成状态。[OpenAI 官方 JSON 模式说明](https://developers.openai.com/api/docs/guides/structured-outputs)。

```bash
# 隐藏输入，不把 Key 写入命令参数或 shell 历史。
gh secret set OPENAI_API_KEY --repo "$OWNER/$REPO"

# 将模型占位文本替换为你实际可用的模型 ID 后执行。
gh variable set OPENAI_MODEL --body '替换为实际模型ID' --repo "$OWNER/$REPO"
gh variable set OPENAI_BASE_URL --body 'https://api.openai.com/v1' --repo "$OWNER/$REPO"
gh variable set CONTENT_MODE --body openai --repo "$OWNER/$REPO"
gh workflow run publish.yml --ref main --repo "$OWNER/$REPO"
```

如果当天已发布，切换模式后仍会跳过，下一天才调用 API。不要为了测试直接删除已发布文章。自动测试用模拟响应覆盖了 API 请求和错误路径，运行 `npm test` 不会消耗额度。真实 API 端到端调用需要你配置可用凭据后验证。

兼容服务：把 `OPENAI_BASE_URL` 改为该提供商文档给出的 HTTPS API 根路径，例如 `https://api.example.com/v1`，不要包含 `/chat/completions`。模型填写对方支持的 ID，Key 也使用对应提供商的 Key。只配置可信提供商，Key 会被发送到该地址；脚本禁止 HTTP、URL 凭据及重定向。部分兼容服务对 token 参数或 JSON 格式支持不同，需要按其文档调整 `requestArticle()`。

本地调用可把 `.env.example` 复制为 `.env`，填入相同配置后运行 `npm run generate`。`.env` 已被 Git 忽略。不要使用 `PUBLIC_` 前缀传递任何密钥，这类变量可能进入浏览器代码。

恢复无需 API 的模式：

```bash
gh variable set CONTENT_MODE --body library --repo "$OWNER/$REPO"
# 确认不再需要 Key 后，可手动撤销提供商凭据并删除仓库 Secret：
# gh secret delete OPENAI_API_KEY --repo "$OWNER/$REPO"
```

## 环境变量与 Secrets

| 名称 | 存储位置 | 默认值 / 用途 |
| --- | --- | --- |
| `OPENAI_API_KEY` | GitHub Actions Secret / 本地 `.env` | 仅 API 模式必需，只供生成步骤使用 |
| `CONTENT_MODE` | Actions Variable / 本地 `.env` | `library`；可改为 `openai` |
| `OPENAI_MODEL` | Actions Variable / 本地 `.env` | 无默认值，API 模式必须填写可用模型 |
| `OPENAI_BASE_URL` | Actions Variable / 本地 `.env` | `https://api.openai.com/v1`，可信兼容接口可覆盖 |
| `CONTENT_TIMEZONE` | 工作流步骤 / 本地 `.env` | `Asia/Shanghai`；自动化固定北京时间 |
| `GITHUB_TOKEN` | GitHub 自动注入 | 无需手工创建 PAT，checkout 用它提交内容 |
| `GITHUB_REPOSITORY` | GitHub 自动注入 | 推导 Pages 域名和项目子路径 |
| `SITE_URL` | 构建进程环境 | 自定义域名覆盖项，本地可用；Actions 需自行在 build 步骤增加 env |
| `BASE_PATH` | 构建进程环境 | 子路径覆盖项；Actions 需自行增加 env。自定义域名通常用 `/` |

`npm run generate` 会读取 `.env`；Astro 常规环境变量由构建环境提供，测试 `SITE_URL` / `BASE_PATH` 时可直接在命令前赋值。修改网站域名还需同步 GitHub Pages 域名设置与 DNS，本项目默认使用 GitHub 提供的域名。

## 自动发布流程

`push main`、每小时 UTC 整点（`0 * * * *`）和 `workflow_dispatch` 都运行同一工作流。日期判断采用北京时间，和 cron 的 UTC 时区相互独立。

1. 检出最新 `main`，Node 24，执行 `npm ci` 和生成逻辑测试。
2. 扫描文章 frontmatter。当天已有非草稿文章就退出生成；否则生成一篇带来源标记的 Markdown。嵌套目录中的文章也参与判断。
3. 校验内容、类型并构建。只有构建成功才提交新增内容；只暂存 `src/content/posts/`，无变化不产生空提交。
4. 推送内容并检查远端是否仍对应本地 HEAD。如果人工 push 竞争导致失败，不强制覆盖，下一次运行会读取最新 `main` 再判断。
5. 上传构建产物，在独立 job 用 Pages 身份令牌发布。机器人推送使用 `GITHUB_TOKEN` 不触发额外 push 工作流，本轮工作流直接完成部署。

工作流共享并发组，关闭取消运行，防止两个运行同时生成和发布。待执行运行可能被 GitHub 合并为较新的待执行运行，下一轮仍按当天文章判断。一个正常的日子通常产生 1 次内容提交和最多 24 次检查/部署；“每小时推送”按有变化才推送实现，不制造无意义空提交。

如果 API 失败、响应被截断、frontmatter 不合法或构建失败，任务报错，不会发布半篇文章；下一个小时再次尝试。API 单次超时 90 秒，每轮最多一次请求。故障期间最多可能每小时调用一次，务必在提供商侧设置预算和告警。

## 手写文章格式

```markdown
---
title: "一篇新文章"
date: "2026-10-16"
tags: ["技术", "编程"]
summary: "用一句话说明文章的内容。"
source: "manual"
draft: false
---

## 一个小标题

正文支持普通 Markdown、代码高亮、列表、表格和引用。
```

文件名建议用英文短横线，避免特殊 URL 字符。标签支持中文，会自动生成独立页面。日期始终加引号，使用真实的 `YYYY-MM-DD`；未来日期目前不会自动隐藏，未准备好的内容请设置 `draft: true`。原始 HTML 会按文本显示，危险链接协议会移除；通过 Markdown 添加的图片会带 `loading="lazy"` / `decoding="async"`。站点没有默认文章大图，以减少加载开销。相对链接与图片请考虑 GitHub Pages 子路径，推荐使用完整 HTTPS 资源地址。

文章页提供更早/更新文章导航，全部页面包含 title、description、canonical、Open Graph。RSS 提供摘要而非未经清理的正文 HTML。主题初次跟随系统，手动切换会保存在浏览器；禁用存储时仍可切换当前页面主题。

## 验收标准

- 本地：`npm ci && npm test && npm run check && npm run build` 成功，`npm audit` 无已知漏洞（以检查时数据库为准）。
- 部署：`gh run watch ... --exit-status` 成功，Pages API `build_type` 为 `workflow`。首页、文章、第二页、中文标签、关于页均可直接打开和刷新；浏览器 Network 无缺失 CSS/JS。
- SEO：查看任意页面源代码，检查独立标题、description、canonical、OG；打开 `/rss.xml`、`/sitemap-index.xml` 和 `/robots.txt`（加仓库 base）。
- 幂等：同一天连续运行两次 `npm run generate`，第一次可能生成，第二次输出 `created:false`，Git 内容无变化。同一天手动发布的文章同样阻止自动生成。
- 跨日：`npm test` 验证北京时间 23:59:59 / 00:00:00 边界与下一天生成。实际连续两天查看 Actions 和 `src/content/posts/`；配置成功不等于已经观测了两天。
- 每小时：`gh run list --workflow publish.yml --event schedule` 查看实际调度记录；正常日应有多个每小时检查。无变化不产生 Git 提交。
- 视觉：320px、390px、768px、1440px 视口无整页横向滚动；键盘可访问导航、分页和主题开关；深浅色有可读对比；系统减少动态效果时不播放过渡。
- API：配置自己的 Secret 和模型后，在尚无当天文章的一天确认 `source: openai` 的新文件出现。自动测试不代表真实账号和模型已经通过验证。

## 权限、安全、额度与故障排查

仓库公开后，源码与文章均可被访问。不要提交 Key、个人隐私或有版权限制的全文。工作流依赖固定到 commit SHA，npm 依赖由 lockfile 锁定；更新依赖后重新运行检查。原始 HTML 禁用是为了防止自动内容执行脚本，不能代替人工核实文章事实与版权。

构建 job 使用 `contents: write` 提交文章，`pages: read` 查询配置；部署 job 使用 `pages: write` 和 `id-token: write` 发布。无需授予 PAT。若组织策略、分支保护或 ruleset 禁止机器人直推，`git push` 会失败；需要仓库管理员为此工作流配置合适权限，或另行改为 PR 发布流程。本项目不会绕过分支保护。

查看错误：`gh run view RUN_ID --log-failed --repo OWNER/REPO`（把这些大写占位符换成实际值）。Pages 未启用请按上面的 POST/PUT 配置；资源 404 请检查 `base` 和仓库名；API 401/403/429 请检查凭据、模型、权限和额度。不要将含私密信息的原始日志公开。

GitHub 定时任务不是可靠时钟：整点高负载时可能延迟甚至丢弃，且只运行默认分支上的工作流；公开仓库 60 天无活动时定时任务可能被自动禁用。每天更新是正常调度和成功运行下的目标，不保证平台故障时仍每日成功，也不自动补写停机期间的历史日期。[GitHub schedule 官方说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。如被停用，先 `gh workflow enable publish.yml --repo "$OWNER/$REPO"`，再手动触发并检查。

公开仓库使用标准 GitHub 托管 runner 通常免分钟费用；私有仓库、额外存储、大型 runner 和提供商 API 有独立计费与限制。每天最多 24 次完整构建，站点变大后可再考虑“无变化跳过构建”的节省方案。额度以账户和当期官方条款为准：[Actions 计费](https://docs.github.com/en/billing/concepts/product-billing/github-actions)、[Pages 使用限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)。GitHub Pages 用于静态站点，不是服务端接口托管。

官方参考：[Astro Pages 部署](https://docs.astro.build/en/guides/deploy/github/)、[GitHub Pages API](https://docs.github.com/en/rest/pages/pages)、[GitHub 自定义部署工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
