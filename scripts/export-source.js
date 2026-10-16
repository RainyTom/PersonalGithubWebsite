import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// 机械导出受控文本文件，供需要一次复制完整源码的读者使用。
const skip = new Set(['.git', 'node_modules', '.astro', 'dist', 'artifacts']);
async function files(dir = '.') {
  const output = [];
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    if (skip.has(entry.name) || entry.name === '.env' || (entry.name.startsWith('.env.') && entry.name !== '.env.example')) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) output.push(...await files(file));
    else if (entry.name !== 'package-lock.json' && /\.(astro|ts|js|mjs|json|css|md|yml|svg|example)$/.test(file) || entry.name === '.gitignore') output.push(file);
  }
  return output;
}
const list = await files();
const sections = await Promise.all(list.map(async file => `## ${file}\n\n\`\`\`\`\`text\n${await readFile(file, 'utf8')}\n\`\`\`\`\`\n`));
await mkdir('artifacts', { recursive: true });
await writeFile('artifacts/PROJECT-SOURCE.md', `# 完整项目源码\n\n由 npm run source 生成。依赖锁文件请直接使用仓库中的 package-lock.json。\n\n${sections.join('\n')}`);
console.log('artifacts/PROJECT-SOURCE.md');
