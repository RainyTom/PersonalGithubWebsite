<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute } from 'vitepress';
import catalog from './catalog';
const entries = catalog.pages.filter(page => page.kind === 'entry');
const tags = [...new Set(entries.flatMap(page => page.tags))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
const selected = ref(''), route = useRoute();
function readHash() { try { selected.value = decodeURIComponent(location.hash.slice(1)); } catch { selected.value = ''; } }
function select(tag: string) { selected.value = tag; history.replaceState(null, '', `${location.pathname}${location.search}${tag ? `#${encodeURIComponent(tag)}` : ''}`); }
onMounted(() => { readHash(); window.addEventListener('hashchange', readHash); });
onUnmounted(() => window.removeEventListener('hashchange', readHash));
watch(() => route.path, () => { if (typeof window !== 'undefined') readHash(); });
const filtered = computed(() => selected.value ? entries.filter(page => page.tags.includes(selected.value)) : entries);
</script>
<template>
  <div class="tag-filter" aria-label="按标签筛选"><button :aria-pressed="!selected" @click="select('')">全部 <small>{{ entries.length }}</small></button><button v-for="tag in tags" :key="tag" :aria-pressed="selected === tag" @click="select(tag)">{{ tag }} <small>{{ entries.filter(page => page.tags.includes(tag)).length }}</small></button></div><p v-if="selected" class="filter-caption">标签：{{ selected }} · {{ filtered.length }} 篇条目</p><EntryList :entries="filtered" />
</template>
