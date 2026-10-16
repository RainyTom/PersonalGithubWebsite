<script lang="ts">
// Mermaid 使用全局配置，所有组件实例串行渲染。
let renderQueue = Promise.resolve();
</script>
<script setup lang="ts">
import { onMounted, ref, watch, useId } from 'vue';
import { useData } from 'vitepress';
const props = defineProps<{ code: string }>();
const { isDark } = useData();
const svg = ref(''), error = ref(''), loading = ref(true);
const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
let revision = 0;
async function renderDiagram() {
  const version = ++revision;
  loading.value = true;
  error.value = '';
  renderQueue = renderQueue.then(async () => {
    try {
      const { default: mermaid } = await import('mermaid');
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true, theme: isDark.value ? 'dark' : 'default', fontFamily: 'system-ui, sans-serif' });
      const result = await mermaid.render(`mermaid-${uid}-${version}`, props.code);
      if (version === revision) svg.value = result.svg;
    } catch {
      if (version === revision) { error.value = '图表语法无法解析，请展开源码检查。'; svg.value = ''; }
    } finally { if (version === revision) loading.value = false; }
  });
  await renderQueue;
}
onMounted(() => { renderDiagram(); });
watch([() => props.code, isDark], () => { renderDiagram(); });
</script>
<template>
  <figure class="mermaid-panel" aria-label="Mermaid 架构图" :aria-busy="loading"><div class="diagram-header"><span>DIAGRAM / MERMAID</span><span v-if="loading">正在渲染…</span><span v-else>可横向滚动</span></div><p v-if="error" role="alert">{{ error }}</p><div v-if="svg" class="mermaid-svg" v-html="svg"></div><details :open="!svg"><summary>图表源码</summary><pre><code>{{ code }}</code></pre></details></figure>
</template>
