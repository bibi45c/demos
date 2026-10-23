# demos

静态页面集合（设计稿、原型、小工具），部署到 `https://bibi45c.github.io/demos/`。

## 新增一个页面

1. 复制 `_template/` 为新目录，目录名用小写短横线（它就是 URL）：`rewind-ui/` → `/demos/rewind-ui/`
2. 改 `index.html`；资源用相对路径（`./img.png`），不要用 `/img.png`
3. 改 `demo.json`（标题、描述、日期、标签）
4. 推送到 `main`，Actions 自动构建并发布

`"hidden": true` 只是不出现在首页列表里，页面本身仍然公开可访问。

自带构建的项目（Vite 等）：把构建产物放进对应目录，并把 `base` 设为 `/demos/<目录名>/`。

## 本地预览

```bash
node scripts/build.mjs
npx serve _site
```

## 首次启用

推送后到仓库 Settings → Pages，把 Source 设为 **GitHub Actions**。
