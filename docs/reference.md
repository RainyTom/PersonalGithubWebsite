---
title: 排版参考
description: 高密度技术手册示例：宽表格、Mermaid 架构图、代码组、信息框与折叠面板。
type: Reference · 速查
---

# 排版参考

<p class="lead">把概念、约束与操作放在同一页。优先使用可扫描的小节、对照表和带边界说明的示例。</p>

## 发布架构

下面的图描述本站的发布路径。构建验证通过后才提交新内容，提交与部署由同一轮工作流完成。

```mermaid
flowchart LR
  Trigger[每小时检查 / 手动运行] --> Generate{当天已有 AI 条目?}
  Generate -->|没有且凭据可用| LLM[调用内容 API]
  Generate -->|已有 / 未配置凭据| Scan[扫描目录与分类别名]
  LLM --> Validate[校验 JSON 与 Markdown]
  Validate --> Scan
  Scan --> Build[VitePress 构建]
  Build --> Commit[有变更时提交与推送]
  Commit --> Deploy[GitHub Pages 部署]
```

## 宽表格

<div class="wide-table">

| 阶段 | 输入 | 输出 | 失败条件 | 重试行为 | 核验方式 |
| --- | --- | --- | --- | --- | --- |
| 内容生成 | 主题、模型、日期 | 带摘要与标签的 Markdown | API 错误、响应不完整、字段不合法 | 下一小时重新尝试 | 检查生成日志与 Frontmatter |
| 目录同步 | 文件夹、分类 YAML、文章 | sidebar / catalog / excluded JSON | 配置字段错误或文章日期不合法 | 修改配置后重跑 | 比较自动生成文件 |
| 静态构建 | 页面、目录、主题组件 | HTML、搜索索引、静态资源 | 失效的内部链接或编译错误 | 修复后重新构建 | 本地预览和 CI 构建 |
| 发布部署 | 构建产物与 Git 提交 | 可访问的网站 | 推送冲突、部署失败 | 保留远端内容，下一轮重试 | Pages 运行记录与页面刷新 |

</div>

## 代码组

::: code-group

```bash [本地预览]
npm ci
npm run docs:dev
```

```bash [构建校验]
npm test
npm run check
npm run docs:build
```

```yaml [分类配置]
name: 分类显示名称
order: 10
collapsed: false
```

:::

## 信息框与折叠面板

::: tip 阅读建议
先确认问题的输入与输出，再沿数据流阅读实现。图中的箭头表达依赖关系，不代表每一步都会执行。
:::

::: warning 运行边界
GitHub 定时任务可能延迟。每天更新依赖平台成功调度、API 可用和构建通过，不能保证整点到达。
:::

::: details 为什么先构建，再自动提交？
生成的 Markdown 可能包含无效链接或编译错误。先验证构建，可以避免将不完整的生成结果自动提交到主分支。手动推送与机器人发生竞争时，不强推覆盖，交给下一次检查处理。
:::

## 双列信息

<div class="dense-grid">
<div>

### 内容层

Markdown 保存正文；Frontmatter 保存摘要和标签；文件夹与 YAML 配置决定知识结构。

</div>
<div>

### 展示层

VitePress 提供导航、搜索与页面大纲；主题扩展提供面包屑、归档和紧凑排版。

</div>
</div>

## 最小检查清单

- 页面可直接打开并刷新，标题与目录一致。
- 架构图显示 SVG，切换主题后文字仍可读。
- 宽表格在手机上局部滚动，整页不横向溢出。
- 搜索输入“分类别名”能找到[内容组织](./authoring.md)正文。
- 使用键盘打开搜索、切换代码组、展开折叠面板。
