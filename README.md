# Global Change Hydrology Group Website

这是后续准备上传到 GitHub Pages 的课题组介绍网站工作目录。

它和 `tv-showcase/` 的定位不同：

- `tv-showcase/`: 给电视循环播放，信息少、字号大、自动轮播。
- `github-pages-site/`: 给访问者主动浏览，信息更完整，有导航、栏目、详情页和可检索内容。

## 当前阶段

当前目录已经包含一个浅色、简约、适合 GitHub Pages 的多页面静态网站。当前版本为英文-only。

入口：

```text
index.html
```

可直接双击打开，也可以上传到 GitHub Pages 作为静态站点。

## 页面结构

```text
index.html          # Home
about.html          # About
people.html         # People
research.html       # Research
publications.html   # Publications
news.html           # News
join.html           # How to join?
person-*.html       # Member profile pages
```

每个页面是独立 HTML 文件，不是单页锚点跳转。

建议先确认：

1. 网站栏目是否合适
2. 英文内容是否完整
3. 是否需要单独的成员页、论文页、项目页
4. GitHub Pages 仓库名称和最终访问路径
5. 头像、邮箱、论文列表是否确认可正式发布

## 如何修改内容

主要内容在：

```text
data/site-20260625.js
```

包括：

- 课题组简介
- 导师信息
- 教育和工作经历
- 研究方向
- 论文
- 新闻
- 联系方式
- How to join 信息

## 信息来源

见：

```text
SOURCES.md
```

## 推荐后续目录

```text
github-pages-site/
├─ public/
│  └─ assets/
├─ src/
│  ├─ components/
│  ├─ data/
│  ├─ pages/
│  └─ styles/
├─ SITE_CONCEPT.md
├─ CONTENT_CHECKLIST.md
└─ README.md
```

如果选择纯静态版本，可以改成：

```text
github-pages-site/
├─ assets/
├─ data/
├─ pages/
├─ index.html
├─ styles.css
├─ app.js
└─ README.md
```
