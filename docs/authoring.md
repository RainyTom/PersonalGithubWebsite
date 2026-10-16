---
title: 内容组织
description: 使用全局 category.config.yaml 定义分类树，支持不存在文件夹的空分类。
type: Guide
---

# 内容组织

所有知识条目放在 `docs/wiki/` 下。仓库根目录的 **`category.config.yaml` 是全局分类配置**，统一定义层级、别名和排序；分类不需要事先创建对应文件夹。

## 层级文件夹

下面是组织方式示例，站点不会自动创建这些示例分类：

```text
category.config.yaml
docs/wiki/
└── data-platform/
    ├── index.md
    └── catalog/
        └── overview.md
```

## 分类别名配置

在仓库根目录的 `category.config.yaml` 中统一配置：

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

| 字段 | 类型 | 默认行为 | 说明 |
| --- | --- | --- | --- |
| `path` | 字符串 | 必填 | 当前层文件夹名，相对于父分类；不要写完整路径 |
| `name` | 字符串 | 使用文件夹名 | 分类在目录和面包屑中的别名 |
| `order` | 数字 | 排在有序项之后 | 同级分类与文章共用，数值越小越靠前 |
| `collapsed` | 布尔值 | `false` | 初始是否折叠，不影响路由和搜索 |
| `hidden` | 布尔值 | `false` | 整个子树不进入目录、归档、搜索和构建产物 |
| `children` | 数组 | `[]` | 下一层分类，同样支持不存在的文件夹 |

**全局配置中声明的分类即使没有文件夹、没有文章也会显示。** 空分类不生成无效链接，不计为文章，首页显示“0 篇条目 · 空”。之后创建对应路径的文章会自动填入原分类，不会出现重复分组。

实际存在但没有在全局配置中声明的非空文件夹仍会自动发现。全局配置优先于旧的每层 `.category.config.yaml`；旧文件仅为兼容保留，不再要求新建。未声明且没有内容的空文件夹不自动显示。配置字段拼错、重复路径和无效类型会导致明确报错。

::: warning 隐藏不是访问控制
`hidden` 和 `draft` 会排除页面构建，但文件仍可能存在于公开 Git 仓库历史。请勿把密钥或私人资料提交到仓库。
:::

## 文章 Frontmatter

````markdown
---
title: "Catalog 的职责边界"
date: "2026-10-16"
summary: "区分元数据发现、权限和表状态管理。"
tags: ["元数据", "速查"]
type: Reference
order: 10
source: manual
draft: false
---

# Catalog 的职责边界

## 核心概念

正文从这里开始。
````

`date` 使用加引号的真实日期。`order` 控制同级文章顺序；未设置时按标题稳定排序。`draft: true` 从构建、目录、搜索和归档排除。分类目录提供 `index.md` 时，分类标题会链接到该页；否则只作为可折叠标题。

## 自动更新

`npm run docs:dev` 会监听目录、Markdown 和分类 YAML 变化。新增文件、移动文件或调整别名后，目录会自动刷新。构建和 Actions 发布前也会重新扫描，因此不用手改 `config.mts`。

```bash
npm run sidebar      # 手动重新生成目录与内容索引
npm run docs:dev     # 本地开发，目录自动刷新
npm run docs:build   # 校验目录并构建站点
```

## 每日 AI 条目

生成主题与目标路径配置在 `config/topics.yaml`。成功生成后自动将缺失分类追加到全局 `category.config.yaml`，不再生成每层配置文件；已有别名不会被覆盖。按北京时间判断当天是否已有 `source: openai` 的非草稿文章，有则跳过。

API Key 和模型由仓库维护者通过 Actions Secrets / Variables 配置。没有凭据时不生成占位内容；每小时任务仍可校验目录和部署手写条目。详细命令见仓库 README。
