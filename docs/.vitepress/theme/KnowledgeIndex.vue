<script setup lang="ts">
import { withBase } from 'vitepress';
import catalog from './catalog';
const entries = catalog.pages.filter(page => page.kind === 'entry');
const tags = new Set(entries.flatMap(page => page.tags));
const roots = catalog.categories.filter(category => category.path.split('/').length === 2);
const target = (path: string) => entries.find(entry => entry.relativePath.startsWith(path + '/'))?.url;
</script>
<template>
  <section class="workspace-overview" aria-label="知识库统计"><div class="workspace-stats"><div><span>知识条目</span><strong>{{ String(entries.length).padStart(2, '0') }}</strong></div><div><span>分类目录</span><strong>{{ String(catalog.categories.length).padStart(2, '0') }}</strong></div><div><span>主题标签</span><strong>{{ String(tags.size).padStart(2, '0') }}</strong></div><div><span>维护方式</span><strong class="stat-text">Markdown + Git</strong></div></div><div v-if="roots.length" class="category-cards"><component :is="target(root.path) ? 'a' : 'div'" v-for="root in roots" :key="root.path" :href="target(root.path) ? withBase(target(root.path)!) : undefined"><span>{{ root.name }}</span><small>{{ entries.filter(p => p.relativePath.startsWith(root.path + '/')).length }} 篇条目 {{ target(root.path) ? '↗' : '· 空' }}</small></component></div></section>
</template>
