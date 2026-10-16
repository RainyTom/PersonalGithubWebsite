<script setup lang="ts">
import { computed } from 'vue';
import { useData, withBase } from 'vitepress';
import catalog from './catalog';
const { page, frontmatter } = useData();
const item = computed(() => catalog.pages.find(item => item.relativePath === page.value.relativePath));
const tagLink = (tag: string) => `${withBase('/tags.html')}#${encodeURIComponent(tag)}`;
</script>
<template>
  <div class="page-meta" v-if="item">
    <nav class="breadcrumbs" aria-label="面包屑"><a :href="withBase('/')">home</a><template v-for="crumb in item.breadcrumbs" :key="crumb.path"><span aria-hidden="true">/</span><a v-if="crumb.url" :href="withBase(crumb.url)">{{ crumb.text }}</a><span v-else>{{ crumb.text }}</span></template><span aria-hidden="true">/</span><span aria-current="page">{{ item.title }}</span></nav>
    <div class="article-properties"><span class="type-badge">{{ frontmatter.type || (item.kind === 'entry' ? 'Knowledge' : 'Workspace') }}</span><time v-if="item.date" :datetime="item.date">{{ item.date }}</time><a v-for="tag in item.tags" :key="tag" class="tag-chip" :href="tagLink(tag)">{{ tag }}</a><span v-if="item.source === 'openai'" class="ai-label">AI 辅助 · 待核实</span></div>
  </div>
</template>
