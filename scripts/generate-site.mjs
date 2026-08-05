import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const templatesDir = path.join(root, "templates");
const docsDir = path.join(root, "docs");
const repoUrl = "https://github.com/HICV-CN/hicv-word-resume-templates";
const pagesUrl = "https://hicv-cn.github.io/hicv-word-resume-templates";

const categoryDescriptions = new Map([
  ["01_表格简历", "传统表格式简历，适合信息密度高、格式稳妥的中文求职场景。"],
  ["02_简约简历", "现代简约 Word 简历模板，覆盖单页、双页、三页和多页。"],
  ["03_封面页", "独立简历封面页，可搭配多页简历或其他求职材料使用。"],
  ["04_活泼明朗", "明快风格，适合校园招聘、实习和部分创意岗位。"],
  ["05_简约优雅", "清爽克制的版式，适合行政、运营和职能类岗位。"],
  ["06_文艺清新", "清新风格，适合传媒、教育、内容和设计相关岗位。"],
  ["07_稳重大气", "正式稳重，适合管理、金融、咨询和成熟职业场景。"],
  ["08_职业风格", "按岗位和职业场景组织的 Word 简历模板。"],
  ["09_行业专属", "覆盖教师、医学、财务、销售、技术等行业方向。"],
  ["10_小红书风格", "更年轻的视觉表达，适合新媒体和创意类场景。"],
  ["11_英文简历", "英文 Resume、英文 CV、外企求职和留学申请模板。"],
  ["12_研究生复试", "研究生复试简历、调剂申请表和复试材料模板。"],
  ["13_小升初自我介绍", "小升初自我介绍和学生成长展示模板。"],
  ["14_其他风格", "彩色、莫兰迪、创意和其他特色简历模板。"],
  ["15_自荐信与范文", "自荐信、求职信和配套范文模板。"],
]);

const landingCategories = [
  {
    slug: "minimalist-single-page",
    title: "简约单页 Word 简历模板",
    shortTitle: "简约单页",
    prefix: "templates/02_简约简历/单页/",
    description: "适合校招、实习和工作经历较精炼的求职者，一页内突出教育、经历、项目与技能。",
    searchTerms: "简约简历模板、单页简历模板、大学生简历模板",
    hicvPath: "/templates",
  },
  {
    slug: "table-resume",
    title: "表格 Word 简历模板",
    shortTitle: "表格简历",
    prefix: "templates/01_表格简历/单页/",
    description: "结构清晰、信息密度高，适合希望使用传统中文表格式版面的求职者。",
    searchTerms: "表格简历模板、个人简历表格、Word 求职简历",
    hicvPath: "/templates",
  },
  {
    slug: "professional-resume",
    title: "职业岗位 Word 简历模板",
    shortTitle: "职业岗位",
    prefix: "templates/08_职业风格/",
    description: "按银行、教师、咨询、四大、法务、外贸等具体岗位场景选择模板。",
    searchTerms: "岗位简历模板、职业简历模板、求职简历模板",
    hicvPath: "/templates",
  },
  {
    slug: "industry-resume",
    title: "行业专属 Word 简历模板",
    shortTitle: "行业专属",
    prefix: "templates/09_行业专属/",
    description: "覆盖互联网、财务、人力资源、医学、销售和教育等行业方向。",
    searchTerms: "行业简历模板、程序员简历、会计简历模板",
    hicvPath: "/templates",
  },
  {
    slug: "english-resume",
    title: "英文 Word 简历模板",
    shortTitle: "英文简历",
    prefix: "templates/11_英文简历/",
    description: "用于外企求职、海外实习和留学申请的可编辑英文 Resume 与 CV 模板。",
    searchTerms: "英文简历模板、English resume template、Word CV",
    hicvPath: "/templates/category/yingwen",
  },
  {
    slug: "postgraduate-interview",
    title: "研究生复试 Word 简历模板",
    shortTitle: "研究生复试",
    prefix: "templates/12_研究生复试/",
    description: "包含复试单页简历、多页科研简历和调剂申请表，适合考研复试准备。",
    searchTerms: "考研复试简历模板、研究生简历、调剂申请表",
    hicvPath: "/templates/category/baoyan",
  },
];

const previewItems = [
  {
    image: "minimalist-001.jpg",
    title: "简约单页模板 001",
    file: "templates/02_简约简历/单页/单页001-简约.docx",
    categories: ["minimalist-single-page", "postgraduate-interview"],
  },
  {
    image: "minimalist-blue-040.jpg",
    title: "极简蓝色单页模板",
    file: "templates/02_简约简历/单页/单页040-极简蓝.docx",
    categories: ["minimalist-single-page"],
  },
  {
    image: "table-001.jpg",
    title: "表格单页模板 001",
    file: "templates/01_表格简历/单页/单页表格简历 01.docx",
    categories: ["table-resume"],
  },
  {
    image: "project-manager-079.jpg",
    title: "项目管理单页模板",
    file: "templates/02_简约简历/单页/单页079.docx",
    categories: ["minimalist-single-page", "industry-resume"],
  },
  {
    image: "english-001.jpg",
    title: "英文单页模板 001",
    file: "templates/11_英文简历/英文简历-单页01.docx",
    categories: ["english-resume"],
  },
  {
    image: "big-four.jpg",
    title: "四大实习简历模板",
    file: "templates/08_职业风格/应聘四大的简历模板.docx",
    categories: ["professional-resume", "industry-resume"],
  },
];

const siteCss = `:root {
  color-scheme: light;
  --ink: #17212b;
  --muted: #53606d;
  --line: #d5dce3;
  --surface: #f5f7f9;
  --brand: #0969da;
  --brand-dark: #0757b5;
  --accent: #1f883d;
  --warm: #a15c1b;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--ink);
  background: white;
  line-height: 1.65;
}
img { display: block; max-width: 100%; }
a { color: var(--brand); text-decoration: none; }
a:hover { text-decoration: underline; }
.inner { width: min(1120px, calc(100% - 40px)); margin: 0 auto; }
.site-nav { border-bottom: 1px solid var(--line); background: white; }
.site-nav .inner { min-height: 58px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.brand { color: var(--ink); font-size: 18px; font-weight: 750; }
.nav-links { display: flex; flex-wrap: wrap; gap: 18px; font-size: 14px; }
.hero { padding: 54px 0 38px; background: var(--surface); border-bottom: 1px solid var(--line); }
.hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) 390px; gap: 44px; align-items: center; }
h1 { max-width: 760px; margin: 0 0 14px; font-size: 46px; line-height: 1.15; letter-spacing: 0; }
h2 { margin: 0 0 18px; font-size: 27px; line-height: 1.3; letter-spacing: 0; }
h3 { margin: 0 0 8px; font-size: 18px; letter-spacing: 0; }
p { color: var(--muted); }
.lead { max-width: 760px; margin: 0 0 22px; font-size: 18px; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.button { display: inline-flex; min-height: 44px; align-items: center; padding: 0 16px; border: 1px solid var(--line); border-radius: 6px; background: white; color: var(--ink); font-weight: 700; }
.button.primary { border-color: var(--brand); background: var(--brand); color: white; }
.button.primary:hover { background: var(--brand-dark); text-decoration: none; }
.hero-preview { border: 1px solid var(--line); background: white; padding: 12px; }
.hero-preview img { width: 100%; aspect-ratio: 2 / 1; object-fit: cover; object-position: top; }
.stats { display: flex; flex-wrap: wrap; gap: 24px; margin-top: 26px; color: var(--muted); }
.stats strong { color: var(--ink); font-size: 22px; margin-right: 6px; }
.band { padding: 46px 0; border-bottom: 1px solid var(--line); }
.band.alt { background: var(--surface); }
.section-intro { max-width: 760px; margin: -8px 0 22px; }
.preview-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.preview { border: 1px solid var(--line); background: white; }
.preview img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; object-position: top; }
.preview figcaption { min-height: 48px; padding: 11px 12px; color: var(--ink); font-size: 14px; font-weight: 700; }
.category-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
.category { border: 1px solid var(--line); background: white; padding: 18px; }
.category p { min-height: 76px; margin: 0 0 12px; font-size: 14px; }
.category .count { color: var(--warm); font-weight: 700; }
.resource-list { border-top: 1px solid var(--line); }
.resource-row { display: grid; grid-template-columns: minmax(0, 1fr) 150px; gap: 16px; align-items: center; padding: 13px 4px; border-bottom: 1px solid var(--line); }
.resource-row span { min-width: 0; overflow-wrap: anywhere; }
.resource-row a { justify-self: start; }
.note { max-width: 820px; padding-left: 14px; border-left: 4px solid var(--accent); color: var(--muted); }
footer { padding: 30px 0; background: #17212b; color: #dbe4ec; }
footer a { color: white; }
footer p { margin: 0; color: #dbe4ec; }
@media (max-width: 820px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-preview { max-width: 520px; }
  .preview-grid, .category-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  h1 { font-size: 38px; }
}
@media (max-width: 560px) {
  .site-nav .inner { align-items: flex-start; flex-direction: column; padding: 14px 0; }
  .nav-links { gap: 10px 14px; }
  .hero { padding-top: 38px; }
  .preview-grid, .category-grid { grid-template-columns: 1fr; }
  .resource-row { grid-template-columns: 1fr; gap: 5px; }
  h1 { font-size: 32px; }
}`;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".DS_Store" || entry.name.startsWith("._") || entry.name.startsWith("~$")) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".docx")) files.push(fullPath);
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function titleFromFile(file) {
  return path.basename(file, ".docx").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function categoryFromFile(file) {
  return rel(file).split("/")[1] ?? "其他";
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function hicvUrl(content, source = "github_pages", pathname = "/templates") {
  const params = new URLSearchParams({
    utm_source: source,
    utm_medium: "referral",
    utm_campaign: "word_resume_templates",
    utm_content: content,
  });
  return `https://hicv.cn${pathname}?${params.toString()}`;
}

function repoFileUrl(file) {
  return `${repoUrl}/blob/main/${encodeURI(file)}`;
}

function navHtml(prefix = "") {
  return `<nav class="site-nav"><div class="inner">
    <a class="brand" href="${prefix}index.html">HICV Word 简历模板库</a>
    <div class="nav-links">
      <a href="${prefix}index.html#previews">模板预览</a>
      <a href="${prefix}index.html#categories">热门分类</a>
      <a href="${repoUrl}/blob/main/TEMPLATE_INDEX.md">完整索引</a>
      <a href="${hicvUrl("nav_online_templates")}">在线模板</a>
    </div>
  </div></nav>`;
}

function previewGrid(items, assetPrefix = "") {
  return `<div class="preview-grid">${items.map((item) => `<figure class="preview">
    <a href="${repoFileUrl(item.file)}"><img src="${assetPrefix}assets/previews/${item.image}" alt="${escapeHtml(item.title)}预览" width="520" height="730" loading="lazy"></a>
    <figcaption>${escapeHtml(item.title)}</figcaption>
  </figure>`).join("")}</div>`;
}

function pageShell({ title, description, canonical, body, prefix = "", schema }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${pagesUrl}/assets/social-preview.png">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="640">
  <link rel="stylesheet" href="${prefix}assets/site.css">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${navHtml(prefix)}
  ${body}
  <footer><div class="inner"><p>模板由 <a href="${hicvUrl("footer_brand")}">HICV.cn</a> 整理。在线浏览模板、制作简历和优化内容，请访问 HICV。</p></div></footer>
</body>
</html>`;
}

const files = (await walk(templatesDir)).sort((a, b) => rel(a).localeCompare(rel(b), "zh-CN"));
const grouped = new Map();
for (const file of files) {
  const category = categoryFromFile(file);
  if (!grouped.has(category)) grouped.set(category, []);
  grouped.get(category).push(file);
}

let markdown = `# HICV 简历模板索引\n\n这里收录了 ${files.length} 套来自 [HICV.cn](${hicvUrl("template_index_intro", "github")}) 的可编辑 Word 简历模板，包含中文简历模板、个人简历模板、求职简历模板、行业专属简历、研究生复试简历、自荐信模板和英文简历模板。\n\n> 所有文件均为 DOCX 格式，适合 Microsoft Word、WPS Office 和兼容 DOCX 的编辑器。在线制作和优化简历请访问 [HICV 在线模板](${hicvUrl("template_index_callout", "github")})。\n\n`;

for (const [category, categoryFiles] of grouped) {
  markdown += `## ${category}\n\n${categoryDescriptions.get(category) ?? "HICV.cn Word 简历模板。"}\n\n模板数量：${categoryFiles.length}\n\n| 模板名称 | 下载文件 |\n| --- | --- |\n`;
  for (const file of categoryFiles) {
    const fileRel = rel(file);
    markdown += `| ${titleFromFile(file)} | [${fileRel}](./${encodeURI(fileRel)}) |\n`;
  }
  markdown += "\n";
}

const categoryCards = landingCategories.map((category) => {
  const categoryFiles = files.filter((file) => rel(file).startsWith(category.prefix));
  return `<article class="category">
    <h3>${category.shortTitle}</h3>
    <p>${category.description}</p>
    <a href="categories/${category.slug}/index.html">浏览 <span class="count">${categoryFiles.length}</span> 套模板</a>
  </article>`;
}).join("");

const featuredFiles = landingCategories.flatMap((category) => files.filter((file) => rel(file).startsWith(category.prefix)).slice(0, 4));
const homeRows = featuredFiles.slice(0, 24).map((file) => `<div class="resource-row"><span>${escapeHtml(titleFromFile(file))}</span><a href="${repoFileUrl(rel(file))}">查看并下载 DOCX</a></div>`).join("");

const homeBody = `<header class="hero"><div class="inner hero-grid">
  <div>
    <h1>2,132 套可编辑 Word 简历模板</h1>
    <p class="lead">覆盖简约单页、表格简历、行业岗位、英文简历和研究生复试等场景，可直接下载 DOCX，也可以进入 HICV 在线套用和优化内容。</p>
    <div class="actions">
      <a class="button primary" href="${hicvUrl("home_primary_cta")}">在线浏览并制作简历</a>
      <a class="button" href="${repoUrl}/tree/main/templates">进入 GitHub 模板目录</a>
    </div>
    <div class="stats"><span><strong>${files.length}</strong>套 DOCX</span><span><strong>${grouped.size}</strong>个资源分类</span><span><strong>6</strong>个高频专题</span></div>
  </div>
  <a class="hero-preview" href="${hicvUrl("home_social_preview")}"><img src="assets/social-preview.png" alt="HICV Word 简历模板精选预览" width="1280" height="640"></a>
</div></header>
<main>
  <section class="band" id="previews"><div class="inner"><h2>真实模板预览</h2><p class="section-intro">以下图片由仓库中的 DOCX 文件直接渲染，不是示意图。点击预览可查看对应文件。</p>${previewGrid(previewItems)}</div></section>
  <section class="band alt" id="categories"><div class="inner"><h2>从高频场景开始</h2><p class="section-intro">根据仓库访问数据，优先整理用户浏览最多的单页、表格和岗位模板。</p><div class="category-grid">${categoryCards}</div></div></section>
  <section class="band"><div class="inner"><h2>热门模板入口</h2><p class="section-intro">完整的 ${files.length} 套模板清单位于仓库索引；这里先列出各高频分类中的代表文件。</p><div class="resource-list">${homeRows}</div><div class="actions"><a class="button" href="${repoUrl}/blob/main/TEMPLATE_INDEX.md">查看完整模板索引</a><a class="button primary" href="${hicvUrl("home_bottom_cta")}">使用在线简历模板</a></div></div></section>
</main>`;

const homeHtml = pageShell({
  title: "Word 简历模板免费下载_中文个人简历模板库_HICV",
  description: `HICV 整理 ${files.length} 套可编辑 Word 简历模板，覆盖简约单页、表格简历、行业岗位、英文简历和研究生复试等求职场景。`,
  canonical: `${pagesUrl}/`,
  body: homeBody,
  schema: {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "HICV Word 简历模板库",
    description: `HICV 整理的 ${files.length} 套可编辑 Word 简历模板。`,
    url: `${pagesUrl}/`,
    creator: { "@type": "Organization", name: "HICV.cn", url: "https://hicv.cn" },
    license: `${repoUrl}/blob/main/LICENSE`,
  },
});

await fs.mkdir(path.join(docsDir, "assets"), { recursive: true });
await fs.writeFile(path.join(docsDir, "assets", "site.css"), siteCss);
await fs.writeFile(path.join(root, "TEMPLATE_INDEX.md"), markdown);
await fs.writeFile(path.join(docsDir, "index.html"), homeHtml);

for (const category of landingCategories) {
  const categoryFiles = files.filter((file) => rel(file).startsWith(category.prefix));
  const categoryPreviews = previewItems.filter((item) => item.categories.includes(category.slug));
  const previewSection = categoryPreviews.length > 0
    ? `<section class="band"><div class="inner"><h2>模板预览</h2>${previewGrid(categoryPreviews, "../../")}</div></section>`
    : "";
  const rows = categoryFiles.slice(0, 60).map((file) => `<div class="resource-row"><span>${escapeHtml(titleFromFile(file))}</span><a href="${repoFileUrl(rel(file))}">查看并下载</a></div>`).join("");
  const body = `<header class="hero"><div class="inner"><h1>${category.title}</h1><p class="lead">${category.description}</p><p>适合搜索：${category.searchTerms}</p><div class="actions"><a class="button primary" href="${hicvUrl(`${category.slug}_primary`, "github_pages", category.hicvPath)}">在线浏览同类模板</a><a class="button" href="${repoUrl}/tree/main/${encodeURI(category.prefix.replace(/\/$/, ""))}">打开 GitHub 文件目录</a></div><div class="stats"><span><strong>${categoryFiles.length}</strong>套可编辑模板</span><span><strong>DOCX</strong>Word / WPS 可用</span></div></div></header>
  <main>${previewSection}<section class="band alt"><div class="inner"><h2>${category.shortTitle}下载目录</h2><p class="section-intro">下面展示前 60 个文件，完整目录可在 GitHub 中继续浏览。</p><div class="resource-list">${rows}</div><div class="actions"><a class="button" href="${repoUrl}/tree/main/${encodeURI(category.prefix.replace(/\/$/, ""))}">查看该分类全部文件</a><a class="button primary" href="${hicvUrl(`${category.slug}_bottom`, "github_pages", category.hicvPath)}">在线套用模板</a></div></div></section><section class="band"><div class="inner"><h2>选择建议</h2><p class="note">优先选择结构清楚、重要经历靠前的模板。完成基本内容后，再根据目标岗位调整经历顺序、关键词和成果表达；需要在线编辑或检查内容时，可进入 HICV 继续完成。</p></div></section></main>`;
  const categoryDir = path.join(docsDir, "categories", category.slug);
  await fs.mkdir(categoryDir, { recursive: true });
  await fs.writeFile(path.join(categoryDir, "index.html"), pageShell({
    title: `${category.title}免费下载_HICV`,
    description: `${category.description}共 ${categoryFiles.length} 套可编辑 DOCX 文件，可使用 Microsoft Word 或 WPS 打开。`,
    canonical: `${pagesUrl}/categories/${category.slug}/`,
    body,
    prefix: "../../",
    schema: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: category.title,
      description: category.description,
      url: `${pagesUrl}/categories/${category.slug}/`,
      isPartOf: { "@type": "WebSite", name: "HICV Word 简历模板库", url: `${pagesUrl}/` },
    },
  }));
}

await fs.writeFile(path.join(docsDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${pagesUrl}/sitemap.xml\n`);
const sitemapUrls = [`${pagesUrl}/`, ...landingCategories.map((category) => `${pagesUrl}/categories/${category.slug}/`)];
await fs.writeFile(path.join(docsDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url, index) => `  <url>\n    <loc>${url}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${index === 0 ? "1.0" : "0.8"}</priority>\n  </url>`).join("\n")}\n</urlset>\n`);

console.log(`Generated ${files.length} templates, ${landingCategories.length} category pages, and tracked HICV links.`);
