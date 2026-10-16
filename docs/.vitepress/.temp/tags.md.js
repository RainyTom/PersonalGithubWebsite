import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent } from "vue/server-renderer";
//#region docs/tags.md
var __pageData = JSON.parse("{\"title\":\"标签\",\"description\":\"通过主题标签检索跨目录的知识条目。\",\"frontmatter\":{\"title\":\"标签\",\"description\":\"通过主题标签检索跨目录的知识条目。\",\"type\":\"Index\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://rainytom.github.io/PersonalGithubWebsite/tags.html\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"标签 | RainyTom Wiki\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"通过主题标签检索跨目录的知识条目。\"}],[\"meta\",{\"property\":\"og:type\",\"content\":\"website\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://rainytom.github.io/PersonalGithubWebsite/tags.html\"}]]},\"headers\":[],\"relativePath\":\"tags.md\",\"filePath\":\"tags.md\",\"lastUpdated\":0}");
var _sfc_main = { name: "tags.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_TagIndex = resolveComponent("TagIndex");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="标签" tabindex="-1">标签 <a class="header-anchor" href="#标签" aria-label="Permalink to “标签”">​</a></h1><p>标签从知识条目的 Frontmatter 自动提取。选择标签可筛选条目，不需要建立单独的分类页面。</p>`);
	_push(ssrRenderComponent(_component_TagIndex, null, null, _parent));
	_push(`</div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("tags.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var tags_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, tags_default as default };
