import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
//#region docs/archive.md
var __pageData = JSON.parse("{\"title\":\"归档\",\"description\":\"按日期浏览知识条目与更新记录。\",\"frontmatter\":{\"title\":\"归档\",\"description\":\"按日期浏览知识条目与更新记录。\",\"type\":\"Archive\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://rainytom.github.io/PersonalGithubWebsite/archive.html\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"归档 | RainyTom Wiki\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"按日期浏览知识条目与更新记录。\"}],[\"meta\",{\"property\":\"og:type\",\"content\":\"website\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://rainytom.github.io/PersonalGithubWebsite/archive.html\"}]]},\"headers\":[],\"relativePath\":\"archive.md\",\"filePath\":\"archive.md\",\"lastUpdated\":0}");
var _sfc_main = { name: "archive.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_EntryList = resolveComponent("EntryList");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="归档" tabindex="-1">归档 <a class="header-anchor" href="#归档" aria-label="Permalink to “归档”">​</a></h1><p>条目按文章日期倒序排列；同一天的条目按文件路径稳定排序。站点使用指南不计入知识条目。</p>`);
	_push(ssrRenderComponent(_component_EntryList, null, null, _parent));
	_push(`</div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("archive.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var archive_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, archive_default as default };
