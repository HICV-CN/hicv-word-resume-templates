import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const templatesDir = path.join(root, "templates");
const docsDir = path.join(root, "docs");
const repoUrl = "https://github.com/HICV-CN/hicv-word-resume-templates";
const pagesUrl = "https://hicv-cn.github.io/hicv-word-resume-templates";
const updatedAt = "2026-09-01";

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

// SEO-focused collections built from the existing DOCX files. A template can
// appear in multiple collections because the pages target different search
// intents; no files are duplicated or renamed.
const scenarioCategories = [
  {
    slug: "campus-recruitment",
    title: "秋招校招 Word 简历模板",
    shortTitle: "秋招 / 校招",
    description: "面向应届生、校园招聘和秋季求职的一页式 Word 简历模板，优先突出教育背景、项目经历和实习经历。",
    searchTerms: "秋招简历模板、校招简历模板、应届生简历、校园招聘简历",
    hicvPath: "/templates",
    filter: (file) => {
      const fileRel = rel(file);
      return /单页/.test(fileRel) && /^(templates\/(01_表格简历|02_简约简历|04_活泼明朗|05_简约优雅|07_稳重大气|08_职业风格|09_行业专属|10_小红书风格)\/)/.test(fileRel);
    },
  },
  {
    slug: "internship-entry-level",
    title: "实习与应届生 Word 简历模板",
    shortTitle: "实习 / 应届生",
    description: "适合第一份实习、应届生求职和经历较少的候选人，用清晰版式呈现课程、项目、社团与实践经历。",
    searchTerms: "实习简历模板、应届生简历模板、大学生简历、无经验简历",
    hicvPath: "/templates",
    filter: (file) => {
      const fileRel = rel(file);
      return /实习|应届/.test(fileRel) || /templates\/(04_活泼明朗|10_小红书风格)\//.test(fileRel);
    },
  },
  {
    slug: "teacher-resume",
    title: "教师教育行业 Word 简历模板",
    shortTitle: "教师 / 教育",
    description: "面向教师、教务、教育培训和高校岗位的 Word 简历模板，方便整理教学经历、证书与课程成果。",
    searchTerms: "教师简历模板、教育行业简历、教师求职简历、教务简历",
    hicvPath: "/templates",
    filter: (file) => /templates\/(08_职业风格|09_行业专属)\//.test(rel(file)) && /教师|老师|教育|幼儿|小学|中学|高校|教务/.test(rel(file)),
  },
  {
    slug: "finance-resume",
    title: "金融财务 Word 简历模板",
    shortTitle: "金融 / 财务",
    description: "覆盖金融、财务、会计、银行、证券和投行等方向，适合校招、实习和有经验求职者使用。",
    searchTerms: "金融简历模板、会计简历模板、银行求职简历、投行简历",
    hicvPath: "/templates",
    filter: (file) => /templates\/(08_职业风格|09_行业专属)\//.test(rel(file)) && /金融|财务|会计|银行|证券|投行/.test(rel(file)),
  },
  {
    slug: "design-resume",
    title: "设计视觉 Word 简历模板",
    shortTitle: "设计 / 视觉",
    description: "面向平面设计、视觉设计、美术和创意岗位的 Word 简历模板，适合与作品集一起准备。",
    searchTerms: "设计师简历模板、视觉设计简历、平面设计简历、美术简历",
    hicvPath: "/templates",
    filter: (file) => /templates\/(08_职业风格|09_行业专属)\//.test(rel(file)) && /设计|视觉|美术|UI|平面/.test(rel(file)),
  },
  {
    slug: "technology-resume",
    title: "技术开发 Word 简历模板",
    shortTitle: "技术 / 开发",
    description: "面向开发、工程师、IT、计算机和通信岗位的 Word 简历模板，重点留出项目、技术栈和成果空间。",
    searchTerms: "程序员简历模板、开发工程师简历、IT 简历、技术岗简历",
    hicvPath: "/templates",
    filter: (file) => /templates\/(08_职业风格|09_行业专属)\//.test(rel(file)) && /技术|工程师|开发|IT|计算机|通信|软件/.test(rel(file)),
  },
];

const allLandingCategories = [...landingCategories, ...scenarioCategories];

function categoryFilesFor(category, allFiles) {
  return category.filter ? allFiles.filter(category.filter) : allFiles.filter((file) => rel(file).startsWith(category.prefix));
}

const previewItems = [
  {
    image: "minimalist-001.jpg",
    title: "简约单页模板 001",
    file: "templates/02_简约简历/单页/单页001-简约.docx",
    categories: ["minimalist-single-page"],
    featured: false,
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
  {
    image: "postgraduate-010.jpg",
    title: "研究生复试单页模板",
    file: "templates/12_研究生复试/复试单页010.docx",
    categories: ["postgraduate-interview"],
  },
];

const siteCss = `:root {
  color-scheme: light;
  --ink: #182230;
  --muted: #667085;
  --line: #d0d5dd;
  --line-soft: #e8eaee;
  --surface: #f6f8fb;
  --surface-blue: #edf4ff;
  --brand: #155eef;
  --brand-dark: #004eeb;
  --accent: #087e8b;
  --warm: #c2412d;
  --success: #137a45;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  color: var(--ink);
  background: white;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}
img { display: block; max-width: 100%; }
a { color: var(--brand); text-decoration: none; }
a:hover { text-decoration: underline; }
button, input { font: inherit; }
.inner { width: min(1160px, calc(100% - 40px)); margin: 0 auto; }
.site-nav { position: sticky; top: 0; z-index: 10; border-bottom: 1px solid var(--line-soft); background: rgba(255, 255, 255, 0.96); }
.site-nav .inner { min-height: 66px; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
.brand { display: inline-flex; align-items: center; gap: 10px; color: var(--ink); font-size: 16px; font-weight: 760; }
.brand:hover { text-decoration: none; }
.brand-mark { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 7px; background: var(--ink); color: white; font-size: 14px; font-weight: 800; }
.nav-links { display: flex; align-items: center; gap: 24px; font-size: 14px; font-weight: 600; }
.nav-links a { color: #475467; }
.nav-links .nav-cta { color: var(--brand); }
.hero { padding: 64px 0 0; background: white; }
.hero-copy { max-width: 880px; padding-bottom: 46px; }
.eyebrow { margin: 0 0 14px; color: var(--accent); font-size: 13px; font-weight: 800; text-transform: uppercase; }
h1 { max-width: 900px; margin: 0 0 18px; font-size: 52px; line-height: 1.12; letter-spacing: 0; }
h2 { margin: 0 0 12px; font-size: 30px; line-height: 1.25; letter-spacing: 0; }
h3 { margin: 0; font-size: 18px; line-height: 1.35; letter-spacing: 0; }
p { color: var(--muted); }
.lead { max-width: 790px; margin: 0; font-size: 18px; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
.button { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; padding: 0 17px; border: 1px solid var(--line); border-radius: 7px; background: white; color: var(--ink); font-weight: 700; }
.button:hover { border-color: #98a2b3; text-decoration: none; }
.button.primary { border-color: var(--brand); background: var(--brand); color: white; }
.button.primary:hover { background: var(--brand-dark); text-decoration: none; }
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.stat { min-height: 94px; display: flex; flex-direction: column; justify-content: center; padding: 16px 28px; border-right: 1px solid var(--line); color: var(--muted); font-size: 13px; }
.stat:first-child { padding-left: 0; }
.stat:last-child { border-right: 0; }
.stat strong { color: var(--ink); font-size: 25px; line-height: 1.2; }
.band { padding: 60px 0; border-bottom: 1px solid var(--line-soft); }
.band.alt { background: var(--surface); }
.section-head { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
.section-intro { max-width: 700px; margin: 0; }
.text-link { flex: 0 0 auto; font-size: 14px; font-weight: 700; }
.preview-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.preview-grid.compact { grid-template-columns: repeat(auto-fit, minmax(250px, 350px)); }
.preview { margin: 0; overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: white; }
.preview-stage { display: grid; width: 100%; height: 360px; place-items: center; overflow: hidden; padding: 22px; background: #edf0f4; }
.preview-stage img { width: auto; height: 316px; max-width: 100%; object-fit: contain; box-shadow: 0 8px 20px rgba(24, 34, 48, 0.14); }
.preview figcaption { min-height: 70px; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 15px; }
.preview-title { min-width: 0; color: var(--ink); font-size: 14px; font-weight: 750; }
.preview-meta { display: block; margin-top: 2px; color: var(--muted); font-size: 11px; font-weight: 500; }
.preview-open { flex: 0 0 auto; font-size: 13px; font-weight: 700; }
.category-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 42px; }
.category { display: grid; grid-template-columns: 48px minmax(0, 1fr) auto; gap: 16px; align-items: center; padding: 22px 4px; border-top: 1px solid var(--line); }
.category:nth-last-child(-n + 2) { border-bottom: 1px solid var(--line); }
.category-index { color: var(--warm); font-size: 13px; font-weight: 800; }
.category p { margin: 5px 0 0; font-size: 13px; }
.category-link { font-size: 13px; font-weight: 700; white-space: nowrap; }
.resource-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 24px 0 16px; }
.resource-search { width: min(420px, 100%); height: 44px; padding: 0 14px; border: 1px solid #98a2b3; border-radius: 7px; background: white; color: var(--ink); }
.resource-search:focus { border-color: var(--brand); outline: 3px solid rgba(21, 94, 239, 0.12); }
.resource-summary { margin: 0; font-size: 13px; }
.resource-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 36px; border-top: 1px solid var(--line); }
.resource-row { min-width: 0; display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; gap: 10px; align-items: center; padding: 13px 2px; border-bottom: 1px solid var(--line); }
.resource-number { color: #98a2b3; font-size: 12px; font-variant-numeric: tabular-nums; }
.resource-name { min-width: 0; overflow-wrap: anywhere; color: var(--ink); font-size: 14px; }
.resource-row a { font-size: 13px; font-weight: 700; white-space: nowrap; }
.resource-row[hidden] { display: none; }
.breadcrumbs { margin: 0 0 22px; color: var(--muted); font-size: 13px; }
.breadcrumbs a { color: var(--muted); }
.search-terms { margin: 16px 0 0; color: #475467; font-size: 13px; }
.note { max-width: 860px; margin: 0; padding-left: 16px; border-left: 3px solid var(--accent); color: var(--muted); }
.conversion { padding: 46px 0; background: var(--ink); }
.conversion .inner { display: flex; align-items: center; justify-content: space-between; gap: 34px; }
.conversion h2 { margin: 0 0 6px; color: white; font-size: 25px; }
.conversion p { margin: 0; color: #cbd5e1; }
.conversion .actions { flex: 0 0 auto; margin: 0; }
.conversion .button:not(.primary) { border-color: #475467; background: transparent; color: white; }
footer { padding: 32px 0; background: #101828; color: #d0d5dd; }
footer a { color: white; }
footer .inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
footer p { margin: 0; color: #d0d5dd; font-size: 13px; }
.footer-links { display: flex; gap: 18px; font-size: 13px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
@media (max-width: 900px) {
  .preview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  h1 { font-size: 44px; }
  .resource-list { grid-template-columns: 1fr; }
  .category { grid-template-columns: 38px minmax(0, 1fr); }
  .category-link { grid-column: 2; }
}
@media (max-width: 640px) {
  .inner { width: min(100% - 28px, 1160px); }
  .site-nav { position: static; }
  .site-nav .inner { min-height: auto; align-items: flex-start; flex-direction: column; gap: 14px; padding: 14px 0; }
  .nav-links { width: 100%; gap: 10px 18px; overflow-x: auto; padding-bottom: 1px; font-size: 13px; }
  .nav-links a { white-space: nowrap; }
  .hero { padding-top: 42px; }
  .hero-copy { padding-bottom: 34px; }
  h1 { font-size: 36px; }
  h2 { font-size: 26px; }
  .lead { font-size: 16px; }
  .stats { grid-template-columns: 1fr; }
  .stat { min-height: 68px; padding: 12px 0; border-right: 0; border-bottom: 1px solid var(--line); }
  .stat:last-child { border-bottom: 0; }
  .band { padding: 44px 0; }
  .section-head { align-items: flex-start; flex-direction: column; gap: 8px; margin-bottom: 22px; }
  .preview-grid, .preview-grid.compact { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: minmax(278px, 84vw); overflow-x: auto; margin-right: -14px; padding: 0 14px 10px 0; scroll-snap-type: x mandatory; }
  .preview-grid { scrollbar-width: none; }
  .preview-grid::-webkit-scrollbar { display: none; }
  .preview { scroll-snap-align: start; }
  .preview-stage { height: 340px; padding: 18px; }
  .preview-stage img { height: 304px; }
  .category-grid { grid-template-columns: 1fr; }
  .category:nth-last-child(2) { border-bottom: 0; }
  .resource-toolbar { align-items: flex-start; flex-direction: column; gap: 10px; }
  .resource-search { width: 100%; }
  .resource-row { grid-template-columns: 24px minmax(0, 1fr); }
  .resource-row a { grid-column: 2; }
  .conversion .inner, footer .inner { align-items: flex-start; flex-direction: column; }
  .conversion .actions { width: 100%; }
  .conversion .button { width: 100%; }
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
    <a class="brand" href="${prefix}index.html"><span class="brand-mark">H</span><span>HICV Word 简历模板库</span></a>
    <div class="nav-links">
      <a href="${prefix}index.html#previews">精选预览</a>
      <a href="${prefix}index.html#categories">模板分类</a>
      <a href="${prefix}index.html#scenarios">求职场景</a>
      <a href="${repoUrl}/blob/main/TEMPLATE_INDEX.md">完整索引</a>
      <a class="nav-cta" href="${hicvUrl("nav_online_templates")}">在线制作简历</a>
    </div>
  </div></nav>`;
}

function previewGrid(items, assetPrefix = "", compact = false) {
  return `<div class="preview-grid${compact ? " compact" : ""}">${items.map((item) => `<figure class="preview">
    <a class="preview-stage" href="${repoFileUrl(item.file)}"><img src="${assetPrefix}assets/previews/${item.image}" alt="${escapeHtml(item.title)}预览" width="520" height="729" loading="lazy"></a>
    <figcaption><span class="preview-title">${escapeHtml(item.title)}<span class="preview-meta">真实 DOCX 渲染 · Word / WPS</span></span><a class="preview-open" href="${repoFileUrl(item.file)}">查看文件 →</a></figcaption>
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
  <meta property="og:updated_time" content="${updatedAt}T00:00:00+08:00">
  <meta property="og:image" content="${pagesUrl}/assets/social-preview.png">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="640">
  <link rel="stylesheet" href="${prefix}assets/site.css">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${navHtml(prefix)}
  ${body}
  <footer><div class="inner"><p>由 <a href="${hicvUrl("footer_brand")}">HICV.cn</a> 整理维护 · 2,132 套真实可编辑 Word 简历模板</p><div class="footer-links"><a href="${repoUrl}">GitHub 仓库</a><a href="${repoUrl}/releases">精选下载</a></div></div></footer>
  <script>
    document.querySelectorAll("[data-resource-search]").forEach((input) => {
      const rows = [...document.querySelectorAll("[data-resource-row]")];
      const count = document.querySelector("[data-resource-count]");
      input.addEventListener("input", () => {
        const keyword = input.value.trim().toLocaleLowerCase();
        let visible = 0;
        rows.forEach((row) => {
          row.hidden = keyword !== "" && !row.textContent.toLocaleLowerCase().includes(keyword);
          if (!row.hidden) visible += 1;
        });
        if (count) count.textContent = visible;
      });
    });
  </script>
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

function categoryCardsFor(categories, indexOffset = 0) {
  return categories.map((category, index) => {
    const categoryFiles = categoryFilesFor(category, files);
    return `<article class="category">
      <span class="category-index">${String(index + indexOffset + 1).padStart(2, "0")}</span>
      <div><h3>${category.shortTitle}</h3><p>${category.description}</p></div>
      <a class="category-link" href="categories/${category.slug}/index.html">${categoryFiles.length} 套模板 →</a>
    </article>`;
  }).join("");
}

const categoryCards = categoryCardsFor(landingCategories);
const scenarioCards = categoryCardsFor(scenarioCategories, landingCategories.length);

const featuredFiles = landingCategories.flatMap((category) => files.filter((file) => rel(file).startsWith(category.prefix)).slice(0, 4));
const homeRows = featuredFiles.slice(0, 12).map((file, index) => `<div class="resource-row"><span class="resource-number">${String(index + 1).padStart(2, "0")}</span><span class="resource-name">${escapeHtml(titleFromFile(file))}</span><a href="${repoFileUrl(rel(file))}">下载 →</a></div>`).join("");

const homeBody = `<header class="hero"><div class="inner">
  <div class="hero-copy">
    <p class="eyebrow">免费 Word 模板库 · 2026 秋招更新</p>
    <h1>Word 简历模板，先看版式再下载</h1>
    <p class="lead">2,132 套真实可编辑 DOCX，覆盖简约单页、表格简历、秋招校招、实习应届、热门行业和英文简历。预览满意后直接下载，也可以进入 HICV 在线制作。</p>
    <div class="actions">
      <a class="button primary" href="${hicvUrl("home_primary_cta")}">在线浏览并制作简历</a>
      <a class="button" href="${repoUrl}/releases/tag/v2026.08">下载秋招精选包</a>
    </div>
  </div>
  <div class="stats"><div class="stat"><strong>${files.length.toLocaleString("zh-CN")}</strong><span>套可编辑 DOCX</span></div><div class="stat"><strong>${grouped.size}</strong><span>个资源分类</span></div><div class="stat"><strong>Word / WPS</strong><span>下载后直接编辑</span></div></div>
</div></header>
<main>
  <section class="band alt" id="previews"><div class="inner"><div class="section-head"><div><h2>精选模板预览</h2><p class="section-intro">全部由仓库中的真实 DOCX 直接渲染，保持原始版式比例，不使用示意图。</p></div><a class="text-link" href="${repoUrl}/tree/main/templates">浏览全部文件 →</a></div>${previewGrid(previewItems.filter((item) => item.featured !== false))}</div></section>
  <section class="band" id="categories"><div class="inner"><div class="section-head"><div><h2>按模板类型选择</h2><p class="section-intro">从访问量最高的单页、表格和岗位模板开始，减少在 2,132 个文件中反复查找。</p></div></div><div class="category-grid">${categoryCards}</div></div></section>
  <section class="band alt" id="scenarios"><div class="inner"><div class="section-head"><div><h2>按求职场景选择</h2><p class="section-intro">围绕秋招、实习和热门行业整理现有模板，方便直接进入更具体的搜索入口。</p></div></div><div class="category-grid">${scenarioCards}</div></div></section>
  <section class="band alt"><div class="inner"><div class="section-head"><div><h2>近期热门下载</h2><p class="section-intro">先列出 12 个高频入口；完整清单仍保留在仓库索引中。</p></div><a class="text-link" href="${repoUrl}/blob/main/TEMPLATE_INDEX.md">打开完整索引 →</a></div><div class="resource-list">${homeRows}</div></div></section>
  <section class="conversion"><div class="inner"><div><h2>选好版式，继续把内容写到位</h2><p>在 HICV 在线套用模板，按目标岗位调整经历顺序、关键词和成果表达。</p></div><div class="actions"><a class="button primary" href="${hicvUrl("home_bottom_cta")}">在线制作简历</a><a class="button" href="${repoUrl}/releases">下载精选包</a></div></div></section>
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
    dateModified: updatedAt,
    keywords: ["Word 简历模板", "秋招简历", "校招简历", "实习简历", "行业简历"],
    creator: { "@type": "Organization", name: "HICV.cn", url: "https://hicv.cn" },
    license: `${repoUrl}/blob/main/LICENSE`,
  },
});

await fs.mkdir(path.join(docsDir, "assets"), { recursive: true });
await fs.writeFile(path.join(docsDir, "assets", "site.css"), siteCss);
await fs.writeFile(path.join(root, "TEMPLATE_INDEX.md"), markdown);
await fs.writeFile(path.join(docsDir, "index.html"), homeHtml);

for (const category of allLandingCategories) {
  const categoryFiles = categoryFilesFor(category, files);
  const categoryPreviews = previewItems.filter((item) => item.categories.includes(category.slug));
  const previewSection = categoryPreviews.length > 0
    ? `<section class="band alt"><div class="inner"><div class="section-head"><div><h2>真实模板预览</h2><p class="section-intro">预览由对应 DOCX 原文件生成，点击可在 GitHub 查看和下载。</p></div></div>${previewGrid(categoryPreviews, "../../", true)}</div></section>`
    : "";
  const visibleFiles = categoryFiles.slice(0, 60);
  const rows = visibleFiles.map((file, index) => `<div class="resource-row" data-resource-row><span class="resource-number">${String(index + 1).padStart(2, "0")}</span><span class="resource-name">${escapeHtml(titleFromFile(file))}</span><a href="${repoFileUrl(rel(file))}">下载 →</a></div>`).join("");
  const categoryDirectoryUrl = category.prefix
    ? `${repoUrl}/tree/main/${encodeURI(category.prefix.replace(/\/$/, ""))}`
    : `${repoUrl}/tree/main/templates`;
  const body = `<header class="hero"><div class="inner"><p class="breadcrumbs"><a href="../../index.html">模板库首页</a> / ${category.shortTitle}</p><div class="hero-copy"><p class="eyebrow">HICV 求职模板专题</p><h1>${category.title}</h1><p class="lead">${category.description}</p><p class="search-terms">常见搜索：${category.searchTerms}</p><div class="actions"><a class="button primary" href="${hicvUrl(`${category.slug}_primary`, "github_pages", category.hicvPath)}">在线浏览同类模板</a><a class="button" href="${categoryDirectoryUrl}">打开 GitHub 目录</a></div></div><div class="stats"><div class="stat"><strong>${categoryFiles.length}</strong><span>套可编辑模板</span></div><div class="stat"><strong>DOCX</strong><span>Word / WPS 可用</span></div><div class="stat"><strong>真实预览</strong><span>从原文件直接渲染</span></div></div></div></header>
  <main>${previewSection}<section class="band"><div class="inner"><div class="section-head"><div><h2>${category.shortTitle}下载目录</h2><p class="section-intro">当前展示前 ${visibleFiles.length} 个文件，可直接筛选；完整的 ${categoryFiles.length} 套模板请进入 GitHub 目录。</p></div><a class="text-link" href="${categoryDirectoryUrl}">查看全部 ${categoryFiles.length} 套 →</a></div><div class="resource-toolbar"><label class="sr-only" for="resource-search">搜索模板名称</label><input id="resource-search" class="resource-search" data-resource-search type="search" placeholder="搜索当前目录，例如：单页、英文、会计"><p class="resource-summary">显示 <strong data-resource-count>${visibleFiles.length}</strong> 个文件</p></div><div class="resource-list">${rows}</div><div class="actions"><a class="button" href="${categoryDirectoryUrl}">打开完整文件目录</a><a class="button primary" href="${hicvUrl(`${category.slug}_bottom`, "github_pages", category.hicvPath)}">在线套用模板</a></div></div></section><section class="band alt"><div class="inner"><h2>选择建议</h2><p class="note">优先选择结构清楚、重要经历靠前的模板。完成基本内容后，再根据目标岗位调整经历顺序、关键词和成果表达；需要在线编辑或检查内容时，可进入 HICV 继续完成。</p></div></section><section class="conversion"><div class="inner"><div><h2>不用从空白文档开始</h2><p>在线选择同类模板，继续完善简历内容并导出投递版本。</p></div><div class="actions"><a class="button primary" href="${hicvUrl(`${category.slug}_conversion`, "github_pages", category.hicvPath)}">在线制作简历</a></div></div></section></main>`;
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
      dateModified: updatedAt,
      isPartOf: { "@type": "WebSite", name: "HICV Word 简历模板库", url: `${pagesUrl}/` },
    },
  }));
}

await fs.writeFile(path.join(docsDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${pagesUrl}/sitemap.xml\n`);
const sitemapUrls = [`${pagesUrl}/`, ...allLandingCategories.map((category) => `${pagesUrl}/categories/${category.slug}/`)];
await fs.writeFile(path.join(docsDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url, index) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${updatedAt}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${index === 0 ? "1.0" : "0.8"}</priority>\n  </url>`).join("\n")}\n</urlset>\n`);

console.log(`Generated ${files.length} templates, ${allLandingCategories.length} category pages, and tracked HICV links.`);
