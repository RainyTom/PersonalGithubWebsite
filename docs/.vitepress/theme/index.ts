import { h } from 'vue';
import DefaultTheme from 'vitepress/theme';
import type { Theme } from 'vitepress';
import PageMeta from './PageMeta.vue';
import MermaidDiagram from './MermaidDiagram.vue';
import KnowledgeIndex from './KnowledgeIndex.vue';
import EntryList from './EntryList.vue';
import TagIndex from './TagIndex.vue';
import './style.css';
export default {
  extends: DefaultTheme,
  Layout: () => h(DefaultTheme.Layout, null, {
    'doc-before': () => h(PageMeta),
    'sidebar-nav-before': () => h('div', { class: 'sidebar-label' }, 'KNOWLEDGE WORKSPACE'),
    'aside-outline-before': () => h('div', { class: 'outline-label' }, 'ON THIS PAGE'),
  }),
  enhanceApp({ app }) {
    app.component('MermaidDiagram', MermaidDiagram);
    app.component('KnowledgeIndex', KnowledgeIndex);
    app.component('EntryList', EntryList);
    app.component('TagIndex', TagIndex);
  },
} satisfies Theme;
