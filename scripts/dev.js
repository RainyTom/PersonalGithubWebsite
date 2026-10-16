import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { updateSidebar } from './update-sidebar.js';
await updateSidebar();
let timer, running = Promise.resolve();
const watcher = watch('docs', { recursive: true }, (_, filename) => {
  if (!filename || filename.startsWith('.vitepress') || filename.startsWith('public')) return;
  clearTimeout(timer);
  timer = setTimeout(() => { running = running.then(() => updateSidebar()).catch(error => console.error(`目录更新失败：${error.message}`)); }, 200);
});
const categoryWatcher = watch('.', (_, filename) => {
  if (filename !== 'category.config.yaml') return;
  clearTimeout(timer);
  timer = setTimeout(() => { running = running.then(() => updateSidebar()).catch(error => console.error(`目录更新失败：${error.message}`)); }, 200);
});
const child = spawn(process.execPath, ['node_modules/vitepress/bin/vitepress.js', 'dev', 'docs', '--host', '127.0.0.1', ...process.argv.slice(2)], { stdio: 'inherit' });
const close = () => { clearTimeout(timer); watcher.close(); categoryWatcher.close(); child.kill('SIGTERM'); };
process.on('SIGINT', close);
process.on('SIGTERM', close);
child.on('exit', code => { clearTimeout(timer); watcher.close(); categoryWatcher.close(); process.exitCode = code || 0; });
