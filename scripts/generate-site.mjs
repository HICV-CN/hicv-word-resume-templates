import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const templatesDir = path.join(root, "templates");
const docsDir = path.join(root, "docs");
const repoUrl = "https://github.com/HICV-CN/hicv-word-resume-templates";

const categoryDescriptions = new Map([
  ["01_表格简历", "传统表格式简历，适合稳妥、清晰、信息密度高的中文简历场景。"],
  ["02_简约简历", "现代简约 Word 简历模板，覆盖单页、双页、三页和多页。"],
  ["03_封面页", "独立简历封面页，可搭配多页简历或求职材料使用。"],
  ["04_活泼明朗", "活泼明朗风格，适合校园招聘、实习、创意岗位。"],
  ["05_简约优雅", "简约优雅风格，适合行政、运营、职能类岗位。"],
  ["06_文艺清新", "文艺清新风格，适合传媒、教育、内容和设计相关岗位。"],
  ["07_稳重大气", "稳重大气风格，适合管理、金融、咨询和成熟职业场景。"],
  ["08_职业风格", "职业化 Word 简历模板，适合通用求职和办公岗位。"],
  ["09_行业专属", "行业专属简历模板，覆盖教师、医学、财务、销售、技术等方向。"],
  ["10_小红书风格", "小红书和社媒风格简历模板，视觉表达更年轻。"],
  ["11_英文简历", "英文简历、英文 CV、外企求职和留学申请相关模板。"],
  ["12_研究生复试", "研究生复试简历、调剂申请表和复试材料模板。"],
  ["13_小升初自我介绍", "小升初自我介绍和学生成长展示模板。"],
  ["14_其他风格", "更多创意、彩色、莫兰迪和特色简历模板。"],
  ["15_自荐信与范文", "自荐信、求职信和相关范文模板。"],
]);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === ".DS_Store" || entry.name.startsWith("._") || entry.name.startsWith("~$")) {
      continue;
    }
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".docx")) {
      files.push(fullPath);
    }
  }
  return files;
}

function rel(file) {
  return path.relative(root, file).split(path.sep).join("/");
}

function titleFromFile(file) {
  let title = path.basename(file, ".docx").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const resumeTitleMap = new Map([
    ["Resume Template for Architecture Position", "建筑岗位英文简历模板"],
    ["Resume Template for Architecture Position 2", "建筑岗位英文简历模板 2"],
    ["Resume Template for Banking1", "银行岗位英文简历模板"],
    ["Resume Template for Chemical Engineering Internship", "化工实习英文简历模板"],
    ["Resume Template for Commercial Officer 商务专员英文简历模版（外贸）", "商务专员英文简历模板（外贸）"],
    ["Resume Template for Commercial Officer 商务专员英文简历模版（外贸） 2", "商务专员英文简历模板（外贸）2"],
    ["Resume Template for Laboratory Position", "实验室岗位英文简历模板"],
    ["Resume Template for Law firm Internship", "律所实习英文简历模板"],
    ["Resume Template for Law firm Internship 2", "律所实习英文简历模板 2"],
    ["Resume Template for Logistics", "物流岗位英文简历模板"],
    ["Resume Template for Software Engineer2", "软件工程师英文简历模板"],
  ]);
  if (resumeTitleMap.has(title)) return resumeTitleMap.get(title);
  return title.replace(/^Resume Template for /i, "英文简历模板：");
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

const files = (await walk(templatesDir)).sort((a, b) => rel(a).localeCompare(rel(b), "zh-CN"));
const grouped = new Map();
for (const file of files) {
  const category = categoryFromFile(file);
  if (!grouped.has(category)) grouped.set(category, []);
  grouped.get(category).push(file);
}

let markdown = `# HICV 简历模板索引

这里收录了 ${files.length} 套来自 [HICV.cn](https://hicv.cn) 的可编辑 Word 简历模板，包含中文简历模板、个人简历模板、求职简历模板、行业专属简历、研究生复试简历、自荐信模板和英文简历模板。

> 所有文件均为 DOCX 格式，适合 Microsoft Word、WPS Office 和兼容 DOCX 的编辑器。更多 AI 简历生成、简历范文、面经和校招信息可访问 [hicv.cn](https://hicv.cn)。

`;

for (const [category, categoryFiles] of grouped) {
  markdown += `## ${category}\n\n`;
  markdown += `${categoryDescriptions.get(category) ?? "HICV.cn Word 简历模板。"}\n\n`;
  markdown += `模板数量：${categoryFiles.length}\n\n`;
  markdown += `| 模板名称 | 下载文件 |\n| --- | --- |\n`;
  for (const file of categoryFiles) {
    const fileRel = rel(file);
    markdown += `| ${titleFromFile(file)} | [${fileRel}](./${encodeURI(fileRel)}) |\n`;
  }
  markdown += "\n";
}

await fs.writeFile(path.join(root, "TEMPLATE_INDEX.md"), markdown);

const categoryCards = [...grouped.entries()].map(([category, categoryFiles]) => {
  const description = categoryDescriptions.get(category) ?? "HICV.cn Word 简历模板。";
  return `<article class="category">
  <h3>${escapeHtml(category.replace(/^\d+_/, ""))}</h3>
  <p>${escapeHtml(description)}</p>
  <a href="${repoUrl}/tree/main/templates/${encodeURI(category)}">查看 ${categoryFiles.length} 套模板</a>
</article>`;
}).join("\n");

const sampleRows = files.slice(0, 80).map((file) => {
  const fileRel = rel(file);
  return `<tr><td>${escapeHtml(titleFromFile(file))}</td><td>${escapeHtml(categoryFromFile(file).replace(/^\d+_/, ""))}</td><td><a href="${repoUrl}/blob/main/${encodeURI(fileRel)}">下载 DOCX</a></td></tr>`;
}).join("\n");

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>HICV 简历模板库 | Word 简历模板免费下载</title>
  <meta name="description" content="HICV.cn 整理 2132 套可编辑 Word 简历模板，包含中文简历模板、个人简历模板、应届生简历模板、行业简历、研究生复试简历、自荐信模板和英文简历模板。">
  <meta name="keywords" content="Word简历模板,简历模板免费下载,中文简历模板,个人简历模板,求职简历模板,应届生简历模板,大学生简历模板,研究生复试简历模板,自荐信模板,英文简历模板,HICV,hicv.cn">
  <link rel="canonical" href="https://hicv-cn.github.io/hicv-word-resume-templates/">
  <meta property="og:title" content="HICV 简历模板库">
  <meta property="og:description" content="2132 套免费可编辑 Word 简历模板，来自 HICV.cn。">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://hicv-cn.github.io/hicv-word-resume-templates/">
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "name": "HICV 简历模板库",
    "description": "HICV.cn 整理的 2132 套可编辑 Word 简历模板，覆盖中文简历模板、个人简历模板、行业简历、研究生复试简历、自荐信模板和英文简历模板。",
    "url": "https://github.com/HICV-CN/hicv-word-resume-templates",
    "creator": {
      "@type": "Organization",
      "name": "HICV.cn",
      "url": "https://hicv.cn"
    },
    "license": "https://github.com/HICV-CN/hicv-word-resume-templates/blob/main/LICENSE"
  }
  </script>
  <style>
    :root {
      color-scheme: light;
      --ink: #17202a;
      --muted: #57606a;
      --line: #d8dee4;
      --surface: #f6f8fa;
      --brand: #0969da;
      --accent: #1f883d;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: var(--ink);
      background: white;
      line-height: 1.6;
    }
    header {
      padding: 64px 24px 36px;
      border-bottom: 1px solid var(--line);
      background: var(--surface);
    }
    main, .inner {
      width: min(1120px, calc(100% - 40px));
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 16px;
      font-size: clamp(34px, 6vw, 58px);
      line-height: 1.08;
      letter-spacing: 0;
    }
    h2 {
      margin: 48px 0 16px;
      font-size: 28px;
      letter-spacing: 0;
    }
    p {
      max-width: 780px;
      margin: 0 0 16px;
      color: var(--muted);
    }
    a {
      color: var(--brand);
      text-decoration: none;
    }
    a:hover { text-decoration: underline; }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }
    .button {
      display: inline-flex;
      align-items: center;
      min-height: 42px;
      padding: 0 16px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: white;
      font-weight: 650;
    }
    .primary {
      background: var(--brand);
      border-color: var(--brand);
      color: white;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 12px;
      margin: 28px 0 0;
      max-width: 760px;
    }
    .stat {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      background: white;
    }
    .stat strong {
      display: block;
      font-size: 28px;
      line-height: 1.1;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 14px;
    }
    .category {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      background: white;
    }
    .category h3 {
      margin: 0 0 8px;
      font-size: 18px;
    }
    .category p {
      min-height: 76px;
      margin-bottom: 12px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 56px;
      font-size: 14px;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 10px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: var(--surface);
      font-weight: 700;
    }
    footer {
      margin-top: 56px;
      padding: 32px 24px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      background: var(--surface);
    }
    @media (max-width: 680px) {
      header { padding-top: 44px; }
      .stats { grid-template-columns: 1fr; }
      table { display: block; overflow-x: auto; }
    }
  </style>
</head>
<body>
  <header>
    <div class="inner">
      <h1>HICV 简历模板库</h1>
      <p>来自 <a href="https://hicv.cn">HICV.cn</a> 的 2132 套免费可编辑 Word 简历模板，覆盖中文简历、个人简历、应届生简历、研究生复试、行业专属简历、自荐信和英文简历等求职场景。</p>
      <div class="actions">
        <a class="button primary" href="${repoUrl}/tree/main/templates">浏览模板目录</a>
        <a class="button" href="${repoUrl}/blob/main/TEMPLATE_INDEX.md">查看完整索引</a>
        <a class="button" href="https://hicv.cn">AI 生成简历</a>
      </div>
      <div class="stats">
        <div class="stat"><strong>${files.length}</strong><span>套 Word 模板</span></div>
        <div class="stat"><strong>${grouped.size}</strong><span>个模板分类</span></div>
        <div class="stat"><strong>免费</strong><span>转发请保留来源</span></div>
      </div>
    </div>
  </header>
  <main>
    <section>
      <h2>模板分类</h2>
      <div class="grid">
        ${categoryCards}
      </div>
    </section>
    <section>
      <h2>热门下载入口</h2>
      <p>下面展示部分 Word 简历模板。完整清单请查看仓库中的模板索引，或访问 HICV.cn 使用 AI 简历生成和在线简历模板。</p>
      <table>
        <thead><tr><th>模板名称</th><th>分类</th><th>下载</th></tr></thead>
        <tbody>
          ${sampleRows}
        </tbody>
      </table>
    </section>
  </main>
  <footer>
    <div class="inner">
      HICV.cn 提供 AI 简历生成、在线简历模板、简历范文、真实面经和校招信息。访问 <a href="https://hicv.cn">hicv.cn</a>。
    </div>
  </footer>
</body>
</html>
`;

await fs.mkdir(docsDir, { recursive: true });
await fs.writeFile(path.join(docsDir, "index.html"), html);

await fs.writeFile(path.join(docsDir, "robots.txt"), `User-agent: *
Allow: /

Sitemap: https://hicv-cn.github.io/hicv-word-resume-templates/sitemap.xml
`);

await fs.writeFile(path.join(docsDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hicv-cn.github.io/hicv-word-resume-templates/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`);

console.log(`Generated index for ${files.length} templates in ${grouped.size} categories.`);
