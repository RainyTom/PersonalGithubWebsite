import { visit } from 'unist-util-visit';

// Markdown 正文不执行原始 HTML；保留代码块和普通 Markdown。
export default function safeMarkdown() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'html') { node.type = 'text'; }
      if (['link', 'image', 'definition'].includes(node.type)) {
        const url = (node.url || '').replace(/[\u0000-\u0020]/g, '');
        if (/^[a-z][a-z\d+.-]*:/i.test(url) && !/^(https?:|mailto:)/i.test(url)) node.url = '#';
      }
      if (node.type === 'image') {
        node.data = { ...node.data, hProperties: { loading: 'lazy', decoding: 'async' } };
      }
    });
  };
}
