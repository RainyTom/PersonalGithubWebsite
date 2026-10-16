import { t as _plugin_vue_export_helper_default } from "./plugin-vue_export-helper.BOaGB7Aw.js";
import { useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderStyle } from "vue/server-renderer";
//#region docs/authoring.md
var __pageData = JSON.parse("{\"title\":\"内容组织\",\"description\":\"使用层级文件夹和 .category.config.yaml 管理 Wiki 分类、别名与排序。\",\"frontmatter\":{\"title\":\"内容组织\",\"description\":\"使用层级文件夹和 .category.config.yaml 管理 Wiki 分类、别名与排序。\",\"type\":\"Guide\",\"head\":[[\"link\",{\"rel\":\"canonical\",\"href\":\"https://rainytom.github.io/PersonalGithubWebsite/authoring.html\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"内容组织 | RainyTom Wiki\"}],[\"meta\",{\"property\":\"og:description\",\"content\":\"使用层级文件夹和 .category.config.yaml 管理 Wiki 分类、别名与排序。\"}],[\"meta\",{\"property\":\"og:type\",\"content\":\"website\"}],[\"meta\",{\"property\":\"og:url\",\"content\":\"https://rainytom.github.io/PersonalGithubWebsite/authoring.html\"}]]},\"headers\":[],\"relativePath\":\"authoring.md\",\"filePath\":\"authoring.md\",\"lastUpdated\":0}");
var _sfc_main = { name: "authoring.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
	_push(`<div${ssrRenderAttrs(_attrs)}><h1 id="内容组织" tabindex="-1">内容组织 <a class="header-anchor" href="#内容组织" aria-label="Permalink to “内容组织”">​</a></h1><p>所有知识条目放在 <code>docs/wiki/</code> 下。文件夹就是分类，可以继续嵌套；目录名决定 URL，分类别名决定界面显示。</p><h2 id="层级文件夹" tabindex="-1">层级文件夹 <a class="header-anchor" href="#层级文件夹" aria-label="Permalink to “层级文件夹”">​</a></h2><p>下面是组织方式示例，站点不会自动创建这些示例分类：</p><div class="language-text line-numbers-mode"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span>docs/wiki/</span></span>
<span class="line"><span>├── .category.config.yaml</span></span>
<span class="line"><span>└── data-platform/</span></span>
<span class="line"><span>    ├── .category.config.yaml</span></span>
<span class="line"><span>    ├── index.md</span></span>
<span class="line"><span>    └── catalog/</span></span>
<span class="line"><span>        ├── .category.config.yaml</span></span>
<span class="line"><span>        └── overview.md</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br></div></div><h2 id="分类别名配置" tabindex="-1">分类别名配置 <a class="header-anchor" href="#分类别名配置" aria-label="Permalink to “分类别名配置”">​</a></h2><p>在需要命名的文件夹里新建 <code>.category.config.yaml</code>：</p><div class="language-yaml line-numbers-mode"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}">元数据与 Catalog</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">order</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">20</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">collapsed</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">false</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">hidden</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">false</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br></div></div><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>默认行为</th><th>说明</th></tr></thead><tbody><tr><td><code>name</code></td><td>字符串</td><td>使用文件夹名</td><td>分类在目录和面包屑中的别名</td></tr><tr><td><code>order</code></td><td>数字</td><td>排在有序项之后</td><td>同级分类与文章共用，数值越小越靠前</td></tr><tr><td><code>collapsed</code></td><td>布尔值</td><td><code>false</code></td><td>初始是否折叠，不影响路由和搜索</td></tr><tr><td><code>hidden</code></td><td>布尔值</td><td><code>false</code></td><td>整个子树不进入目录、归档、搜索和构建产物</td></tr></tbody></table><p>配置字段拼错会在构建时提示错误。空分类不显示，不存在配置文件时自动使用文件夹名。建议最多四层主题目录，避免侧栏过深。</p><div class="warning custom-block"><p class="custom-block-title">隐藏不是访问控制</p><p><code>hidden</code> 和 <code>draft</code> 会排除页面构建，但文件仍可能存在于公开 Git 仓库历史。请勿把密钥或私人资料提交到仓库。</p></div><h2 id="文章-frontmatter" tabindex="-1">文章 Frontmatter <a class="header-anchor" href="#文章-frontmatter" aria-label="Permalink to “文章 Frontmatter”">​</a></h2><div class="language-markdown line-numbers-mode"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
		"--shiki-light": "#24292e",
		"--shiki-dark": "#e1e4e8",
		"--shiki-light-bg": "#fff",
		"--shiki-dark-bg": "#24292e"
	})}" tabindex="0" dir="ltr"><code><span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">---</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">title</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;Catalog 的职责边界&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">date</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;2026-10-16&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">summary</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;区分元数据发现、权限和表状态管理。&quot;</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">tags</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: [</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;元数据&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">, </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">&quot;速查&quot;</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">]</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">type</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">Reference</span></span>
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
	})}">source</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}">manual</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#11782a",
		"--shiki-dark": "#85E89D"
	})}">draft</span><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">: </span><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-dark": "#79B8FF"
	})}">false</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">---</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}"># Catalog 的职责边界</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#005CC5",
		"--shiki-light-font-weight": "bold",
		"--shiki-dark": "#79B8FF",
		"--shiki-dark-font-weight": "bold"
	})}">## 核心概念</span></span>
<span class="line"></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#24292E",
		"--shiki-dark": "#E1E4E8"
	})}">正文从这里开始。</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br></div></div><p><code>date</code> 使用加引号的真实日期。<code>order</code> 控制同级文章顺序；未设置时按标题稳定排序。<code>draft: true</code> 从构建、目录、搜索和归档排除。分类目录提供 <code>index.md</code> 时，分类标题会链接到该页；否则只作为可折叠标题。</p><h2 id="自动更新" tabindex="-1">自动更新 <a class="header-anchor" href="#自动更新" aria-label="Permalink to “自动更新”">​</a></h2><p><code>npm run docs:dev</code> 会监听目录、Markdown 和分类 YAML 变化。新增文件、移动文件或调整别名后，目录会自动刷新。构建和 Actions 发布前也会重新扫描，因此不用手改 <code>config.mts</code>。</p><div class="language-bash line-numbers-mode"><button title="Copy code" data-copied="Copied" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark" style="${ssrRenderStyle({
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
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> sidebar</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">      # 手动重新生成目录与内容索引</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> docs:dev</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">     # 本地开发，目录自动刷新</span></span>
<span class="line"><span style="${ssrRenderStyle({
		"--shiki-light": "#6F42C1",
		"--shiki-dark": "#B392F0"
	})}">npm</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> run</span><span style="${ssrRenderStyle({
		"--shiki-light": "#032F62",
		"--shiki-dark": "#9ECBFF"
	})}"> docs:build</span><span style="${ssrRenderStyle({
		"--shiki-light": "#62687b",
		"--shiki-dark": "#818e99"
	})}">   # 校验目录并构建站点</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br></div></div><h2 id="每日-ai-条目" tabindex="-1">每日 AI 条目 <a class="header-anchor" href="#每日-ai-条目" aria-label="Permalink to “每日 AI 条目”">​</a></h2><p>生成主题与目标路径配置在 <code>config/topics.yaml</code>。成功生成后自动创建目标分类和别名配置；已有别名不会被覆盖。按北京时间判断当天是否已有 <code>source: openai</code> 的非草稿文章，有则跳过。</p><p>API Key 和模型由仓库维护者通过 Actions Secrets / Variables 配置。没有凭据时不生成占位内容；每小时任务仍可校验目录和部署手写条目。详细命令见仓库 README。</p></div>`);
}
var _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
	const ssrContext = useSSRContext();
	(ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("authoring.md");
	return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
var authoring_default = /*#__PURE__*/ _plugin_vue_export_helper_default(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
//#endregion
export { __pageData, authoring_default as default };
