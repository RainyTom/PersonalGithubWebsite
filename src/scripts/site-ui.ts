const root = document.documentElement;
const button = document.querySelector<HTMLButtonElement>('#theme-toggle');
const system = matchMedia('(prefers-color-scheme: dark)');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
type Transition = { finished: Promise<void>; skipTransition: () => void };
const transitionDocument = document as Document & { startViewTransition?: (update: () => void) => Transition };
let currentTransition: Transition | undefined;
const currentTheme = () => root.dataset.theme || (system.matches ? 'dark' : 'light');
function updateToggle() { button?.setAttribute('aria-pressed', String(currentTheme() === 'dark')); }
function setTheme(next: string, save: boolean) {
  const apply = () => {
    root.dataset.theme = next;
    updateToggle();
    if (save) try { localStorage.setItem('theme', next); } catch {}
  };
  currentTransition?.skipTransition();
  if (transitionDocument.startViewTransition && !reduced.matches) {
    currentTransition = transitionDocument.startViewTransition(apply);
    currentTransition.finished.catch(() => {});
  } else apply();
}
button?.addEventListener('click', () => setTheme(currentTheme() === 'dark' ? 'light' : 'dark', true));
system.addEventListener('change', event => {
  try { if (['light', 'dark'].includes(localStorage.getItem('theme') || '')) return; } catch {}
  setTheme(event.matches ? 'dark' : 'light', false);
});
updateToggle();
requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('theme-ready')));

// 为所有 Markdown 代码块添加语言标题、行号样式和复制按钮，内容仍由 Shiki 高亮。
document.querySelectorAll<HTMLPreElement>('.prose pre.astro-code').forEach(pre => {
  const code = pre.querySelector('code');
  if (!code) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'code-block';
  const header = document.createElement('div');
  header.className = 'code-header';
  const language = document.createElement('span');
  language.textContent = pre.dataset.language || 'code';
  const copy = document.createElement('button');
  copy.type = 'button'; copy.textContent = '复制代码'; copy.setAttribute('aria-label', '复制代码');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent || '');
      copy.textContent = '已复制 ✓';
    } catch { copy.textContent = '复制失败，请手动选择'; }
    setTimeout(() => { copy.textContent = '复制代码'; }, 1800);
  });
  pre.before(wrapper); header.append(language, copy); wrapper.append(header, pre);
});

const searchLink = document.querySelector<HTMLAnchorElement>('.nav-search');
function focusSearch() {
  const search = document.querySelector<HTMLInputElement>('#content-search');
  if (search) { search.focus(); search.select(); return true; }
  return false;
}
searchLink?.addEventListener('click', event => { if (focusSearch()) event.preventDefault(); });
document.addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (!focusSearch() && searchLink) location.assign(searchLink.href);
  }
});
