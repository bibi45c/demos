// 把每个含 index.html 的顶层目录复制到 _site/，并按 demo.json 生成首页索引。
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');
const skip = new Set(['scripts', 'node_modules', '_site', '_template']);

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

rmSync(out, { recursive: true, force: true });
mkdirSync(out);

const demos = [];
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith('.') || skip.has(entry.name)) continue;
  const dir = join(root, entry.name);
  if (!existsSync(join(dir, 'index.html'))) {
    console.warn(`skip ${entry.name}/: no index.html`);
    continue;
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(entry.name)) {
    throw new Error(`Folder name must be lowercase kebab-case (it becomes the URL): ${entry.name}`);
  }
  const metaPath = join(dir, 'demo.json');
  const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, 'utf8')) : {};
  cpSync(dir, join(out, entry.name), { recursive: true, filter: (src) => basename(src) !== 'demo.json' });
  // hidden 只是不出现在索引里，页面本身仍可通过 URL 公开访问
  if (!meta.hidden) {
    demos.push({ slug: entry.name, title: meta.title || entry.name, description: meta.description || '', date: meta.date || '', tags: meta.tags || [] });
  }
}
demos.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

const cards = demos.map((d) => `
      <li>
        <a href="./${d.slug}/">
          <span class="title">${escape(d.title)}</span>
          ${d.description ? `<span class="desc">${escape(d.description)}</span>` : ''}
          <span class="meta">${escape(d.date)}${d.tags.map((t) => ` · ${escape(t)}`).join('')}</span>
        </a>
      </li>`).join('');

writeFileSync(join(out, 'index.html'), `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Demos</title>
  <style>
    :root { --bg: #fafaf9; --fg: #1c1917; --muted: #78716c; --line: #e7e5e4; --hover: #f5f5f4; }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #1c1917; --fg: #fafaf9; --muted: #a8a29e; --line: #44403c; --hover: #292524; }
    }
    body { margin: 0; padding: 48px 16px; background: var(--bg); color: var(--fg); font: 16px/1.6 system-ui, sans-serif; }
    main { max-width: 720px; margin: 0 auto; }
    h1 { margin: 0 0 4px; font-size: 28px; }
    .lead { margin: 0 0 32px; color: var(--muted); }
    .lead a { color: inherit; }
    ul { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
    li a { display: grid; gap: 2px; padding: 16px 8px; border-bottom: 1px solid var(--line); color: inherit; text-decoration: none; }
    li a:hover { background: var(--hover); }
    .title { font-weight: 600; }
    .desc { color: var(--fg); opacity: .85; }
    .meta { color: var(--muted); font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <h1>Demos</h1>
    <p class="lead">设计稿、原型和小工具。<a href="/">← 回到博客</a></p>
    <ul>${cards || '\n      <li>暂无内容</li>'}
    </ul>
  </main>
</body>
</html>
`);

console.log(`Built ${demos.length} listed demo(s) into _site/`);
