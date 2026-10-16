<script setup lang="ts">
import { withBase } from 'vitepress';
import catalog, { type Entry } from './catalog';
defineProps<{ entries?: Entry[] }>();
const all = catalog.pages.filter(page => page.kind === 'entry');
</script>
<template>
  <div v-if="(entries || all).length" class="entry-table-wrap"><table class="entry-table"><thead><tr><th>条目 / 摘要</th><th>分类路径</th><th>更新时间</th></tr></thead><tbody><tr v-for="entry in entries || all" :key="entry.url"><td><a :href="withBase(entry.url)">{{ entry.title }}</a><p v-if="entry.summary">{{ entry.summary }}</p><div class="entry-tags"><span v-for="tag in entry.tags" :key="tag">{{ tag }}</span></div></td><td class="entry-category">{{ entry.breadcrumbs.slice(1).map(item => item.text).join(' / ') || '未分类' }}</td><td class="entry-date">{{ entry.date || '—' }}</td></tr></tbody></table></div>
  <div v-else class="empty-state"><span class="empty-icon">[ &nbsp; ]</span><strong>知识条目尚未创建</strong><p>在 docs/wiki/ 下按主题建立文件夹并添加 Markdown。目录、归档和标签会自动更新。</p><a :href="withBase('/authoring.html')">查看内容组织方式 →</a></div>
</template>
