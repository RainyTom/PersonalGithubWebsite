# 博客静态资源

图片建议放在 `public/assets/images/`，也可以按文章建立子目录。

文章或 `about/index.md` 中写：

```markdown
![图片说明](/assets/images/example.svg)
```

构建时会自动加上 GitHub Pages 的仓库子路径，并添加懒加载。请使用仓库内图片，不要在 Markdown 中写 `public/` 前缀。文件名建议使用英文短横线；PNG、JPEG、WebP、AVIF、GIF、SVG 均可直接放在此目录。

示例图片位于 `images/example.svg`，用于验证资源路径，不会作为文章封面展示。
