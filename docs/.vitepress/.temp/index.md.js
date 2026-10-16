import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
//#region docs/index.md
var __pageData = JSON.parse("{\"title\":\"知识库概览\",\"description\":\"以目录组织知识，以链接连接上下文。\",\"frontmatter\":{\"title\":\"知识库概览\",\"description\":\"以目录组织知识，以链接连接上下文。\",\"type\":\"Workspace\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://rainytom.github.io/PersonalGithubWebsite/\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"知识库概览 | RainyTom Wiki\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"以目录组织知识，以链接连接上下文。\"}],[\"meta\",{\"property\":\"og:type\",\"content\":\"website\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://rainytom.github.io/PersonalGithubWebsite/\"}]]},\"headers\":[],\"relativePath\":\"index.md\",\"filePath\":\"index.md\",\"lastUpdated\":0}");
var _sfc_main = { name: "index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_KnowledgeIndex = resolveComponent("KnowledgeIndex");
	const _component_EntryList = resolveComponent("EntryList");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="知识库" tabindex="-1">知识库 <a class="header-anchor" href="#知识库" aria-label="Permalink to “知识库”">​</a></h1><p class="lead">以目录组织知识，以链接连接上下文。记录可复用的概念、决策与实践，让每一条笔记都有清晰的位置。</p>`);
	_push(ssrRenderComponent(_component_KnowledgeIndex, null, null, _parent));
	_push(`<h2 id="知识条目" tabindex="-1">知识条目 <a class="header-anchor" href="#知识条目" aria-label="Permalink to “知识条目”">​</a></h2>`);
	_push(ssrRenderComponent(_component_EntryList, null, null, _parent));
	_push(`<h2 id="工作方式" tabindex="-1">工作方式 <a class="header-anchor" href="#工作方式" aria-label="Permalink to “工作方式”">​</a></h2><table tabindex="0"><thead><tr><th>入口</th><th>用途</th><th>组织方式</th></tr></thead><tbody><tr><td>左侧目录</td><td>沿主题逐级阅读</td><td>文件夹层级与分类别名</td></tr><tr><td>全局搜索</td><td>从正文快速定位问题</td><td>中文分词与本地全文索引，按 <code>Ctrl / ⌘ + K</code></td></tr><tr><td><a href="./archive.html">归档</a></td><td>按时间回看知识条目</td><td>文章日期倒序</td></tr><tr><td><a href="./tags.html">标签</a></td><td>跨目录连接同一概念</td><td>Frontmatter 标签</td></tr></tbody></table><h2 id="维护约定" tabindex="-1">维护约定 <a class="header-anchor" href="#维护约定" aria-label="Permalink to “维护约定”">​</a></h2><p>条目以 Markdown 保存，文件夹形成分类，<code>.category.config.yaml</code> 设置显示名称与排序。目录、归档与标签从内容自动生成，无需维护链接清单。</p><div class="tip custom-block"><p class="custom-block-title">开始记录</p><p>查看<a href="./authoring.html">内容组织</a>创建第一个条目，或打开<a href="./reference.html">排版参考</a>了解表格、架构图和代码组的写法。</p></div></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("index.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var docs_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, docs_default as default };
