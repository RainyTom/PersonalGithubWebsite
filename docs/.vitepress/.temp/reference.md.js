import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { resolveComponent, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderStyle } from "vue/server-renderer";
//#region docs/reference.md
var __pageData = JSON.parse("{\"title\":\"排版参考\",\"description\":\"高密度技术手册示例：宽表格、Mermaid 架构图、代码组、信息框与折叠面板。\",\"frontmatter\":{\"title\":\"排版参考\",\"description\":\"高密度技术手册示例：宽表格、Mermaid 架构图、代码组、信息框与折叠面板。\",\"type\":\"Reference · 速查\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://rainytom.github.io/PersonalGithubWebsite/reference.html\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"排版参考 | RainyTom Wiki\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"高密度技术手册示例：宽表格、Mermaid 架构图、代码组、信息框与折叠面板。\"}],[\"meta\",{\"property\":\"og:type\",\"content\":\"website\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://rainytom.github.io/PersonalGithubWebsite/reference.html\"}]]},\"headers\":[],\"relativePath\":\"reference.md\",\"filePath\":\"reference.md\",\"lastUpdated\":0}");
var _sfc_main = { name: "reference.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	const _component_MermaidDiagram = resolveComponent("MermaidDiagram");
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="排版参考" tabindex="-1">排版参考 <a class="header-anchor" href="#排版参考" aria-label="Permalink to “排版参考”">​</a></h1><p class="lead">把概念、约束与操作放在同一页。优先使用可扫描的小节、对照表和带边界说明的示例。</p><h2 id="发布架构" tabindex="-1">发布架构 <a class="header-anchor" href="#发布架构" aria-label="Permalink to “发布架构”">​</a></h2><p>下面的图描述本站的发布路径。构建验证通过后才提交新内容，提交与部署由同一轮工作流完成。</p>`);
	_push(ssrRenderComponent(_component_MermaidDiagram, { code: "flowchart LR\n  Trigger[每小时检查 / 手动运行] --> Generate{当天已有 AI 条目?}\n  Generate -->|没有且凭据可用| LLM[调用内容 API]\n  Generate -->|已有 / 未配置凭据| Scan[扫描目录与分类别名]\n  LLM --> Validate[校验 JSON 与 Markdown]\n  Validate --> Scan\n  Scan --> Build[VitePress 构建]\n  Build --> Commit[有变更时提交与推送]\n  Commit --> Deploy[GitHub Pages 部署]\n" }, null, _parent));
	_push(`<h2 id="宽表格" tabindex="-1">宽表格 <a class="header-anchor" href="#宽表格" aria-label="Permalink to “宽表格”">​</a></h2><div class="wide-table"><table tabindex="0"><thead><tr><th>阶段</th><th>输入</th><th>输出</th><th>失败条件</th><th>重试行为</th><th>核验方式</th></tr></thead><tbody><tr><td>内容生成</td><td>主题、模型、日期</td><td>带摘要与标签的 Markdown</td><td>API 错误、响应不完整、字段不合法</td><td>下一小时重新尝试</td><td>检查生成日志与 Frontmatter</td></tr><tr><td>目录同步</td><td>文件夹、分类 YAML、文章</td><td>sidebar / catalog / excluded JSON</td><td>配置字段错误或文章日期不合法</td><td>修改配置后重跑</td><td>比较自动生成文件</td></tr><tr><td>静态构建</td><td>页面、目录、主题组件</td><td>HTML、搜索索引、静态资源</td><td>失效的内部链接或编译错误</td><td>修复后重新构建</td><td>本地预览和 CI 构建</td></tr><tr><td>发布部署</td><td>构建产物与 Git 提交</td><td>可访问的网站</td><td>推送冲突、部署失败</td><td>保留远端内容，下一轮重试</td><td>Pages 运行记录与页面刷新</td></tr></tbody></table></div><h2 id="代码组" tabindex="-1">代码组 <a class="header-anchor" href="#代码组" aria-label="Permalink to “代码组”">​</a></h2><div class="vp-code-group"><div class="tabs"><input type="radio" name="group-125" id="tab-126" checked><label data-title="本地预览" for="tab-126">本地预览</label><input type="radio" name="group-125" id="tab-127"><label data-title="构建校验" for="tab-127">构建校验</label><input type="radio" name="group-125" id="tab-128"><label data-title="分类配置" for="tab-128">分类配置</label></div><div class="blocks"><div class="language-bash active line-numbers-mode"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> ci</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> docs:dev</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br></div></div><div class="language-bash line-numbers-mode"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> test</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> check</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> docs:build</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><div class="language-yaml line-numbers-mode"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">name</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">分类显示名称</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">order</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">10</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">collapsed</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">false</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div></div></div><h2 id="信息框与折叠面板" tabindex="-1">信息框与折叠面板 <a class="header-anchor" href="#信息框与折叠面板" aria-label="Permalink to “信息框与折叠面板”">​</a></h2><div class="tip custom-block"><p class="custom-block-title">阅读建议</p><p>先确认问题的输入与输出，再沿数据流阅读实现。图中的箭头表达依赖关系，不代表每一步都会执行。</p></div><div class="warning custom-block"><p class="custom-block-title">运行边界</p><p>GitHub 定时任务可能延迟。每天更新依赖平台成功调度、API 可用和构建通过，不能保证整点到达。</p></div><details class="details custom-block"><summary>为什么先构建，再自动提交？</summary><p>生成的 Markdown 可能包含无效链接或编译错误。先验证构建，可以避免将不完整的生成结果自动提交到主分支。手动推送与机器人发生竞争时，不强推覆盖，交给下一次检查处理。</p></details><h2 id="双列信息" tabindex="-1">双列信息 <a class="header-anchor" href="#双列信息" aria-label="Permalink to “双列信息”">​</a></h2><div class="dense-grid"><div><h3 id="内容层" tabindex="-1">内容层 <a class="header-anchor" href="#内容层" aria-label="Permalink to “内容层”">​</a></h3><p>Markdown 保存正文；Frontmatter 保存摘要和标签；文件夹与 YAML 配置决定知识结构。</p></div><div><h3 id="展示层" tabindex="-1">展示层 <a class="header-anchor" href="#展示层" aria-label="Permalink to “展示层”">​</a></h3><p>VitePress 提供导航、搜索与页面大纲；主题扩展提供面包屑、归档和紧凑排版。</p></div></div><h2 id="最小检查清单" tabindex="-1">最小检查清单 <a class="header-anchor" href="#最小检查清单" aria-label="Permalink to “最小检查清单”">​</a></h2><ul><li>页面可直接打开并刷新，标题与目录一致。</li><li>架构图显示 SVG，切换主题后文字仍可读。</li><li>宽表格在手机上局部滚动，整页不横向溢出。</li><li>搜索输入“分类别名”能找到<a href="./authoring.html">内容组织</a>正文。</li><li>使用键盘打开搜索、切换代码组、展开折叠面板。</li></ul></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("reference.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var reference_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, reference_default as default };
