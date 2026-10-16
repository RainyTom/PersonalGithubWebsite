# RainyTom Wiki

高信息密度的个人知识库：VitePress + Vue + 纯 CSS + Mermaid + 中文本地全文搜索，发布到 GitHub Pages。电脑端左侧目录、中央正文、右侧大纲；移动端目录抽屉。支持面包屑、标签、归档、宽表格、代码组、信息框、折叠面板、深色模式和 RSS。

旧 Astro 默认文章、分类与本地主题库已清理，保留 Git 历史可恢复。`docs/wiki/` 初始为空；“内容组织”“排版参考”是站点维护说明，不进入文章归档和标签。没有预置领域分类或虚构知识条目。

版本说明：固定使用 **VitePress 2.0.0-alpha.20**。检查时稳定版 1.6.4 的 Vite 依赖仍有已知漏洞，因此采用 2.x 预发行版并锁定依赖；请理解预发行版本可能有兼容性变化，升级前运行测试、类型检查与构建。Node.js 要求 24+。项目不会自动追随最新版。

## 目录结构

```text
.
├── .env.example
├── .gitignore
├── .github/workflows/publish.yml
├── package.json
├── package-lock.json
├── tsconfig.json
├── README.md
├── category.config.yaml                 # 全局分类树；不存在的文件夹也显示为空分类
├── config/topics.yaml                   # AI 主题、目标路径、各层别名
├── docs/
│   ├── index.md                         # 知识库概览
│   ├── archive.md                       # 归档
│   ├── tags.md                          # 标签筛选
│   ├── authoring.md                     # 文件夹与分类配置使用说明
│   ├── reference.md                     # 完整高密度 Markdown 排版示例
│   ├── public/favicon.svg
│   ├── wiki/
│   │   └── .gitkeep
│   └── .vitepress/
│       ├── config.mts                   # 搜索、Mermaid fence、SEO、导航
│       ├── generated/                   # 自动维护，勿手动编辑
│       │   ├── sidebar.json
│       │   ├── catalog.json
│       │   └── excluded.json
│       └── theme/
│           ├── index.ts
│           ├── catalog.ts
│           ├── style.css
│           ├── PageMeta.vue
│           ├── MermaidDiagram.vue
│           ├── KnowledgeIndex.vue
│           ├── EntryList.vue
│           └── TagIndex.vue
├── scripts/
│   ├── dev.js                           # 本地预览 + 目录变化监听
│   ├── wiki.js                          # 文件扫描、校验、分类树和内容索引
│   ├── update-sidebar.js
│   ├── frontmatter.js
│   ├── feed.js                          # 摘要 RSS 输出
│   ├── generate-content.js
│   └── export-source.js                 # 完整源码导出
└── tests/
    ├── feed.test.js
    ├── generate-content.test.js
    └── wiki.test.js
```

`npm run source` 生成 `artifacts/PROJECT-SOURCE.md`，包含所有手写源文件和配置的完整内容（包括 YAML、Vue、config.mts）。依赖锁文件直接取仓库中的 `package-lock.json`。生成物、测试截图、`.env` 不公开提交。

## 本地运行

```bash
npm ci
npm run docs:dev
# 打开终端显示的 localhost 地址，通常为 http://localhost:5173/
```

开发脚本监听 `docs/` 的新增、移动、删除和分类 YAML 变更，自动重建 sidebar/catalog/excluded；VitePress 自动刷新页面。生成文件只有内容改变时才写入，避免无意义重载。

```bash
npm run sidebar
npm test
npm run check
npm run docs:build
npm run docs:preview
```

构建输出到 `docs/.vitepress/dist/`，包含 `sitemap.xml`、摘要订阅 `rss.xml` 和 `robots.txt`。预览默认根路径；模拟线上项目子路径时：

```bash
BASE_PATH=/PersonalGithubWebsite/ npm run docs:build
BASE_PATH=/PersonalGithubWebsite/ npm run docs:preview
# 打开预览地址下的 /PersonalGithubWebsite/
```

VitePress 输出显式 `.html` 文章链接，分类 `index.md` 使用目录链接，支持 GitHub Pages 直接刷新深层页面。

## 用文件夹形成分类

例如，按需创建以下目录（示例不会预先写入知识库）：

```text
category.config.yaml              # 全局配置
docs/wiki/data-platform/
└── catalog/
    ├── index.md                  # 可选，分类入口页
    └── permissions.md
```

只在仓库根目录维护一个 **`category.config.yaml`**。`path` 是当前层文件夹名，使用 `children` 定义下一层：

```yaml
name: 知识目录
categories:
  - path: data-platform
    name: 数据平台
    order: 10
    collapsed: false
    children:
      - path: catalog
        name: 元数据与 Catalog
        order: 20
        collapsed: false
        hidden: false
```

| 字段 | 默认值 | 作用 |
| --- | --- | --- |
| `path` | 必填 | 当前层文件夹名，相对于父分类，不能包含斜杠或 `..` |
| `name` | 文件夹名 | 显示别名，不改变磁盘路径与 URL |
| `order` | 未指定排最后 | 同级分类和文章共享排序，越小越靠前 |
| `collapsed` | `false` | 初始折叠状态，支持多层菜单 |
| `hidden` | `false` | 子树不进入导航、搜索、归档和构建产物 |
| `children` | `[]` | 嵌套分类列表 |

**全局配置声明的分类即使没有对应文件夹或文章，也显示为空分类。** 不创建虚构页面或失效链接，不计为文章；首页显示“0 篇条目 · 空”。有文章后自动合并进入对应分类。未声明的非空文件夹仍会自动发现，未声明的空文件夹不显示。当前全局配置为 `categories: []`，请按需填入自己的分类。

全局字段优先于旧的每层 `.category.config.yaml`，旧格式仅为兼容保留，不再要求创建。配置字段拼错、重复路径、类型错误和重复 YAML key 会明确报错。分类包含 `index.md` 时标题可点击，否则只显示分类名称与可展开子项。同序项按中文标题及路径稳定排序，建议不超过六层。

文章完整示例：

````markdown
---
title: "Catalog 的职责边界"
date: "2026-10-16"
summary: "区分元数据发现、权限和表状态管理。"
tags: ["元数据", "速查"]
type: "Reference · 速查"
order: 10
source: manual
draft: false
---

# Catalog 的职责边界

## 职责对照

| 职责 | 输入 | 输出 |
| --- | --- | --- |
| 元数据发现 | 名称和范围 | 可定位的表或数据集 |
| 权限检查 | 身份和动作 | 允许或拒绝 |

::: tip 使用边界
不同系统对 Catalog 的职责划分不同，实际行为应核对所用实现。
:::
````

日期加引号，使用真实 `YYYY-MM-DD`。无 Frontmatter 的手写 Markdown 也能显示，标题回退为一级标题或文件名；自动文章使用完整 Frontmatter。`draft: true` 从导航、搜索和产物排除；未来日期不自动隐藏，草稿请显式设置。

`docs/reference.md` 包含可直接运行的 Mermaid 图、宽表格、Code Groups、Custom Containers、Details 和双列布局，不将示例文章放入知识目录。

## Mermaid 与中文搜索

Mermaid 通过 `config.mts` 的 Markdown fence renderer 转成 Vue 组件，客户端按需加载 `mermaid`。使用 `securityLevel: strict`，主题切换时重新渲染；无 JavaScript 时可查看图表源码。渲染失败会显示明确提示和源码，维护者应修正语法。

````markdown
```mermaid
flowchart LR
  A[Markdown] --> B[目录扫描]
  B --> C[VitePress 构建]
  C --> D[GitHub Pages]
```
````

本地全文搜索不需要第三方账号，浏览器按需加载静态索引。使用 `Intl.Segmenter` 和中文二字切分匹配连续汉字。按 `Ctrl+K`（macOS `⌘+K`）打开。示例：搜索“分类别名”应定位到“内容组织”的正文。

## 每日 AI 更新

已移除本地模板文章生成模式。脚本调用 OpenAI / 兼容 Chat Completions API，要求支持 `response_format: json_object` 和 `max_completion_tokens`。JSON 模式不保证字段符合要求，脚本还校验标题、摘要、标签、正文字数和至少一个表格或 Mermaid 图；拒绝 HTML/Vue 模板表达式和危险链接。[OpenAI 官方 JSON 模式说明](https://developers.openai.com/api/docs/guides/structured-outputs)。

按北京时间判断当天是否存在非草稿 `source: openai` 文章。手写条目不占用每日 AI 额度；同日最多自动生成一篇，不会修改人工维护的文章。脚本会向模型提供近期标题以减少重复，并拒绝完全相同的标题。无法保证模型生成内容没有事实错误或语义重复。

主题配置示例：

```yaml
topics:
  - title: "技术决策记录：背景、约束和验证方式"
    path: engineering/decisions
    categories: ["工程实践", "技术决策"]
    tags: ["架构", "文档"]
```

主题 `path` 位于 `docs/wiki/` 下，安全路径段由小写字母、数字和短横线组成，禁止 `..` 与绝对路径。主题的 `categories` 逐层对应建议别名；同一路径不能配置冲突别名。成功生成后将缺失分类追加到全局 `category.config.yaml`，已有别名/排序不覆盖，不再新建每层配置文件。生成文章后立即重新维护目录索引，构建时还会再次同步。

默认每小时检查一次，每轮最多一次 API 请求，90 秒超时。不配置 Key 或模型时跳过 AI，运行摘要和 warning 会说明；站点仍正常构建并发布手写内容。API 出错时任务失败，下小时重试，不用本地模板冒充 AI 新稿。不补写离线期间历史日期。

本地 `.env`：把 `.env.example` 复制为 `.env`，填入自己的凭据后运行 `npm run generate`。不要把 Key 发到聊天或提交 Git。测试使用模拟响应，不消耗 API 额度。

## 现有仓库配置 AI 并运行

**手动操作：**获取你的 API Key，确认额度，并填写实际可用且支持上述请求参数的模型 ID。仓库中不会预设模型或写入任何凭据。

```bash
gh auth status
gh secret set OPENAI_API_KEY --repo RainyTom/PersonalGithubWebsite

# 将占位文本替换为账号实际可用的模型 ID
gh variable set OPENAI_MODEL --body '替换为实际模型ID' --repo RainyTom/PersonalGithubWebsite
gh variable set OPENAI_BASE_URL --body 'https://api.openai.com/v1' --repo RainyTom/PersonalGithubWebsite

gh workflow run publish.yml --ref main --repo RainyTom/PersonalGithubWebsite
gh run list --workflow publish.yml --limit 5 --repo RainyTom/PersonalGithubWebsite
```

兼容服务使用提供商自己的 Key、模型和 HTTPS API 根路径（不要包含 `/chat/completions`）。脚本禁止 URL 凭据、查询参数和 HTTP 重定向。该 Key 会发送到此地址，只能设置可信服务。部分兼容服务参数不同，按其官方文档调整 `requestArticle()`。

| 变量 | 存储位置 | 用途 |
| --- | --- | --- |
| `OPENAI_API_KEY` | Actions Secret / 本地 `.env` | API 鉴权，必需 |
| `OPENAI_MODEL` | Actions Variable / 本地 `.env` | 实际模型 ID，必需 |
| `OPENAI_BASE_URL` | Actions Variable / 本地 `.env` | 默认 `https://api.openai.com/v1` |
| `CONTENT_TIMEZONE` | 工作流步骤 / 本地 `.env` | 默认北京时间 `Asia/Shanghai` |
| `GITHUB_TOKEN` | GitHub 自动注入 | 内容推送与 Pages 部署，无需 PAT |
| `GITHUB_REPOSITORY` | GitHub 自动注入 | 自动推导仓库域名、base 和编辑链接 |
| `BASE_PATH` | 构建进程环境 | 可覆盖默认项目子路径，须以 `/` 开始/结束 |
| `SITE_URL` | 构建进程环境 | 可覆盖 Pages 域名；自定义域名还需 DNS 和 Pages 设置 |

旧版本的 `CONTENT_MODE` 已不再使用。`BASE_PATH` / `SITE_URL` 在工作流中若需覆盖，请显式增加到构建步骤 `env`，它们不是凭据。

## 从零开始的 gh 命令

现有仓库已初始化，不必再次创建。下面供新建副本使用。把 `REPO` 换成期望仓库名；`OWNER` 自动获取当前账号。创建的仓库为公开仓库。

```bash
# 1. 在浏览器完成设备授权，使用 HTTPS Git
gh auth login --hostname github.com --git-protocol https --web
gh auth status
gh auth setup-git
OWNER=$(gh api user --jq .login)
REPO=wiki-repo

# 2. 本地验证（需要 Node.js 24+ 和 npm）
npm ci
npm run sidebar
npm test
npm run check
npm run docs:build

# 3. 只对尚未初始化的新目录执行；已有 Git 仓库先检查 remote
git init -b main
git add .
git commit -m "feat: create folder-based VitePress wiki"
gh repo create "$REPO" --public --source=. --remote=origin --push

# 4. 新站启用 GitHub Actions 发布来源
gh api --method POST "repos/$OWNER/$REPO/pages" -f build_type=workflow

# 仅当 Pages 已存在时，改为下面这条更新命令
# gh api --method PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow

# 5. Secret 隐藏输入；模型占位文本须替换
gh secret set OPENAI_API_KEY --repo "$OWNER/$REPO"
gh variable set OPENAI_MODEL --body '替换为实际模型ID' --repo "$OWNER/$REPO"
gh variable set OPENAI_BASE_URL --body 'https://api.openai.com/v1' --repo "$OWNER/$REPO"

# 6. 触发并观察手动运行
gh workflow run publish.yml --ref main --repo "$OWNER/$REPO"
gh run list --workflow publish.yml --event workflow_dispatch --limit 5 --repo "$OWNER/$REPO"
RUN_ID=$(gh run list --workflow publish.yml --event workflow_dispatch --limit 1 --json databaseId --jq '.[0].databaseId' --repo "$OWNER/$REPO")
gh run watch "$RUN_ID" --exit-status --repo "$OWNER/$REPO"

# 7. 确认 Pages 来源和网站地址；失败时取日志
gh api "repos/$OWNER/$REPO/pages" --jq '{url: .html_url, build_type: .build_type}'
gh run view "$RUN_ID" --log-failed --repo "$OWNER/$REPO"
git pull --ff-only
```

首次 push 可能早于 Pages 启用，首次任务若报未配置 Pages，配置后手动触发即可。没有 API 凭据也可跳过第 5 步先部署空知识库。新建个人主页仓库使用 `你的用户名.github.io`，配置会自动用根路径。fork 后如定时任务未启用，执行 `gh workflow enable publish.yml --repo "$OWNER/$REPO"`。

## 自动发布流水线

`push main`、`workflow_dispatch`、`schedule: cron: '0 * * * *'` 共用工作流级并发锁，整个流程串行执行，不取消正在运行的发布。

1. 检出最新 main，安装 Node 24，`npm ci`，运行测试。
2. 每日文章缺失且凭据齐全时生成 Markdown；否则说明跳过原因。
3. 重新扫描分类和目录，执行类型校验与 VitePress 构建。
4. 构建通过后，仅暂存 `category.config.yaml`、`docs/wiki/` 和生成目录 JSON；有变化才提交并推送。
5. 上传 `docs/.vitepress/dist`，由独立部署 job 发布 Pages。

先构建再提交的顺序可以避免自动提交无法编译的文章。机器人使用 `GITHUB_TOKEN` 推送不会启动额外 push 工作流，当前工作流直接完成部署。检测到远端变化时失败，不强推；下一小时基于最新 main 重试。

“每小时推送”指每小时检查、有变更才推送，不制造空提交。每天最多一篇 AI 条目，但手写文章没有此限制。定时使用 UTC 整点，文章日期独立按北京时间计算。构建 job 的 `contents: write` 用于提交，`pages: read` 用于读取站点配置；部署 job 仅 `pages: write` / `id-token: write`。若 main 有分支保护禁止机器人直推，需要管理员配置允许的发布方式或改成 PR 流程，脚本不会绕过保护。

本地生成使用 `docs/wiki/.generation.lock` 防并发。正常失败会清理锁；若被强制终止而留下锁，请先确认没有其他生成进程，再只移除这个锁目录后重试。Actions 使用全新 checkout，不会继承本地残留锁。

## 验收标准

- `npm test` 覆盖目录层级、别名、排序、空分类、草稿、隐藏、幂等、跨日、API 故障、凭据缺失和并发锁。
- `npm run check` 和 `npm run docs:build` 成功；构建不会忽略死链接错误。
- 320/390/768/1440px 下无整页横向滚动；手机“目录”按钮打开抽屉；电脑左栏固定、右侧显示页面大纲。
- 打开排版参考，Mermaid 显示 SVG 而非只有源码；切换深浅色后图仍可读，宽表格只在局部滚动。
- `Ctrl+K` 搜索“分类别名”，能从全文索引找到内容组织；英文关键词也能搜索。
- 修改全局 `category.config.yaml` 中的 `name`，目录和面包屑同步变更；仅声明分类而不创建文件夹时，仍显示空分类。移动或删除文章后，已声明分类继续保留。
- 新增知识文章后，归档、标签、分类计数同步变化；草稿、隐藏内容不出现在搜索或构建产物中。
- Actions 成功且网站可以直接刷新深层 URL；查看页面源码包含 title、description、canonical 和 Open Graph，`sitemap.xml` 可访问。
- 手动连续触发两次：已有当天 AI 条目时不再请求 API、不产生第二篇文章或空提交。
- 配置真实 Key 和模型后，观察新的 `source: openai` 文章；自动测试通过不代表真实账号 API 已验证。
- `gh run list --workflow publish.yml --event schedule` 查看实际定时执行；跨日效果需后续真实运行观测，不能用一次手动运行替代。

## 注意事项

API 文章会显示“AI 辅助 · 待核实”，需要核对事实与来源。Markdown 在 VitePress 中可以使用 Vue；自动内容禁止执行这些语法，但手写内容仍属于可信站点源码。分类隐藏和草稿排除不是私密存储，公开 Git 历史仍可能保留内容。

不要硬编码 Token，不要把 Key 放在 `VITE_` 环境变量或客户端主题里。工作流中的 Key 仅提供给生成步骤；外部请求不记录原始错误响应。API 故障可能最多每小时请求一次，在提供商侧设置预算与告警。

GitHub 整点定时任务可能延迟或被丢弃；公开仓库长期无活动可能暂停定时任务。正常运行下目标为每天一篇，无法保证平台/API 故障时仍每日更新。[GitHub 定时任务说明](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)。

公开仓库的标准 GitHub 托管 runner 通常免分钟费，额外存储、大型 runner、私有仓库和 API 有不同额度，以账户实际规则为准。本站每小时仍构建部署一次，即使没有内容变更；后续可按需优化跳过未变化构建。[Actions 计费](https://docs.github.com/en/billing/concepts/product-billing/github-actions)、[Pages 使用限制](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)。

参考：[VitePress 文档](https://vitepress.dev/)、[VitePress 仓库](https://github.com/vuejs/vitepress)、[Mermaid 安全配置](https://mermaid.js.org/config/usage.html)、[GitHub Pages API](https://docs.github.com/en/rest/pages/pages)。
