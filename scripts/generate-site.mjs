import { promises as fs } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { guides } from "./guide-content.mjs";

const root = process.cwd();
const templatesDir = path.join(root, "templates");
const docsDir = path.join(root, "docs");
const repoUrl = "https://github.com/HICV-CN/hicv-word-resume-templates";
const pagesUrl = "https://hicv-cn.github.io/hicv-word-resume-templates";
const updatedAt = "2026-10-14";
const baibianVideoUrl = "https://prod-oss.hicv.cn/template/baibian-video-900-30fps.mp4";

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
    hicvPath: "/templates/category/kaoyanfushi",
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
    hicvPath: "/templates/category/xiaozhao",
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
    hicvPath: "/templates/category/shixisheng",
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

const additionalRoleCategories = [
  {
    slug: "medical-nursing", title: "医疗护理 Word 简历模板", shortTitle: "医疗 / 护理",
    description: "收录医学、医生、护士与护理方向模板，适合整理教育背景、见习实习、专业技能和资格证书。涉及临床经历时请避免填写患者隐私。",
    hicvPath: "/templates",
    filter: (file) => /templates\/(08_职业风格|09_行业专属)\//.test(rel(file)) && /医学|医生|护士|护理/.test(path.basename(file)),
  },
  {
    slug: "operations-ecommerce", title: "运营电商 Word 简历模板", shortTitle: "运营 / 电商",
    description: "收录市场运营与电商运营模板，重点展示负责的渠道、执行动作、复盘方法和可核实的业务结果。",
    hicvPath: "/templates",
    filter: (file) => /templates\/(08_职业风格|09_行业专属)\//.test(rel(file)) && /运营|电商/.test(path.basename(file)),
  },
  {
    slug: "hr-administration", title: "行政人事 Word 简历模板", shortTitle: "行政 / 人事",
    description: "覆盖行政、文秘、人事与人力资源方向，可按招聘、员工服务、流程管理与协调工作整理经历。",
    hicvPath: "/templates",
    filter: (file) => /templates\/(08_职业风格|09_行业专属)\//.test(rel(file)) && /行政|文秘|人事|人力资源/.test(path.basename(file)),
  },
  {
    slug: "sales-marketing", title: "销售市场 Word 简历模板", shortTitle: "销售 / 市场",
    description: "覆盖销售、市场专员与营销岗位，用客户类型、渠道、负责范围和真实成果说明个人贡献。",
    hicvPath: "/templates",
    filter: (file) => /templates\/(08_职业风格|09_行业专属)\//.test(rel(file)) && /销售|市场|营销/.test(path.basename(file)),
  },
];

const styleCategories = [
  {
    slug: "two-page-resume", title: "双页 Word 简历模板", shortTitle: "双页简历",
    description: "收录简约与表格双页模板，适合经历较多、需要展开项目的求职者。第一页优先保留与岗位最相关的内容。",
    hicvPath: "/templates",
    filter: (file) => /templates\/(01_表格简历|02_简约简历)\/双页\//.test(rel(file)),
  },
  {
    slug: "multi-page-resume", title: "多页 Word 简历模板", shortTitle: "三页 / 多页",
    description: "收录三页、四页和多页简历，适合需要详细呈现工作、科研或项目经历的场景；是否提交长简历以招聘要求为准。",
    hicvPath: "/templates",
    filter: (file) => /templates\/(01_表格简历|02_简约简历)\/(三页|四页|多页)\//.test(rel(file)),
  },
  {
    slug: "lively-resume", title: "活泼明朗 Word 简历模板", shortTitle: "活泼明朗",
    prefix: "templates/04_活泼明朗/", hicvPath: "/templates",
    description: "明快配色与较轻松的视觉风格，可用于校园实践和创意方向申请。保留清晰的标题层级，避免装饰盖过经历。",
  },
  {
    slug: "elegant-resume", title: "简约优雅 Word 简历模板", shortTitle: "简约优雅",
    prefix: "templates/05_简约优雅/", hicvPath: "/templates",
    description: "偏简洁、留白清楚的版式，适合希望页面清爽且易读的求职者，便于组织教育、工作和项目经历。",
  },
  {
    slug: "fresh-resume", title: "文艺清新 Word 简历模板", shortTitle: "文艺清新",
    prefix: "templates/06_文艺清新/", hicvPath: "/templates",
    description: "较柔和的配色和文艺风格，可搭配内容、传媒或教育方向的经历。投递前确认招聘方是否有固定格式要求。",
  },
  {
    slug: "formal-resume", title: "稳重大气 Word 简历模板", shortTitle: "稳重大气",
    prefix: "templates/07_稳重大气/", hicvPath: "/templates",
    description: "偏正式的职场版式，适合需要突出工作职责、项目规模和管理经历的简历，优先保证信息可读性。",
  },
  {
    slug: "xiaohongshu-style", title: "小红书风格 Word 简历模板", shortTitle: "小红书风格",
    prefix: "templates/10_小红书风格/", hicvPath: "/templates",
    description: "收录仓库中的小红书风格模板，适合偏好年轻视觉表达的求职者。使用前检查字体、图片与打印效果。",
  },
  {
    slug: "creative-resume", title: "创意彩色 Word 简历模板", shortTitle: "创意 / 彩色",
    prefix: "templates/14_其他风格/", hicvPath: "/templates",
    description: "包含莫兰迪、艺术气质、现代时尚等特色风格。选择与目标岗位一致的表达，导出后检查对比度和阅读顺序。",
  },
  {
    slug: "resume-cover", title: "Word 简历封面模板", shortTitle: "简历封面",
    prefix: "templates/03_封面页/", hicvPath: "/templates",
    description: "独立封面可搭配纸质材料或多页作品材料。普通在线投递通常可以直接呈现简历正文，不必为了装饰增加页数。",
  },
  {
    slug: "cover-letter", title: "Word 自荐信与求职信模板", shortTitle: "自荐信 / 求职信",
    prefix: "templates/15_自荐信与范文/", hicvPath: "/templates",
    description: "收录自荐信、求职信与配套范文，便于说明申请动机及岗位匹配点。请替换示例经历，避免直接照搬正文。",
  },
];

const allLandingCategories = [...landingCategories, ...scenarioCategories, ...additionalRoleCategories, ...styleCategories];

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
[id] { scroll-margin-top: 88px; }
[hidden] { display: none !important; }
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
.brand-logo { width: 36px; height: 36px; flex: 0 0 36px; object-fit: contain; }
.nav-links { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 20px; font-size: 14px; font-weight: 600; }
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
.hero-promise { max-width: 820px; margin: 0 0 16px; color: var(--ink); font-size: 24px; font-weight: 700; line-height: 1.5; }
.trust-proof { max-width: 900px; margin: 0 0 28px; padding-left: 18px; border-left: 3px solid var(--accent); }
.trust-proof p { margin: 8px 0; }
.actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 26px; }
.button { display: inline-flex; min-height: 44px; align-items: center; justify-content: center; padding: 0 17px; border: 1px solid var(--line); border-radius: 7px; background: white; color: var(--ink); font-weight: 700; }
.button:hover { border-color: #98a2b3; text-decoration: none; }
.button.primary { border-color: var(--brand); background: var(--brand); color: white; }
.button.primary:hover { background: var(--brand-dark); text-decoration: none; }
button.button { cursor: pointer; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
.quick-links { display: flex; flex-wrap: wrap; gap: 12px 24px; margin-top: 22px; font-size: 14px; }
.guide-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 28px; }
.guide-item { padding-top: 18px; border-top: 2px solid var(--accent); }
.guide-item p { margin: 12px 0; font-size: 14px; }
.reading { max-width: 800px; }
.reading section + section { margin-top: 36px; }
.reading h2 { font-size: 26px; }
.reading li { margin: 10px 0; }
.reading blockquote { margin: 20px 0; padding: 12px 20px; border-left: 3px solid var(--accent); background: var(--surface); }
.reading blockquote p { margin: 0; }
.reading p, .reading li { overflow-wrap: anywhere; }
.guide-toc { display: flex; flex-wrap: wrap; gap: 10px 22px; margin-top: 24px; }
.updated { font-size: 13px; }
.choice-columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 36px; }
.choice-option { padding-top: 20px; border-top: 3px solid var(--accent); }
.choice-option:last-child { border-color: var(--line); }
.choice-option li { margin: 10px 0; }
.choice-option ul { padding-left: 20px; }
.choice-note { margin-top: 28px; font-size: 13px; }
.online-nudge { margin: 24px 0; padding: 20px 0; border-top: 2px solid var(--accent); border-bottom: 1px solid var(--line); }
.online-nudge p { max-width: 800px; margin: 10px 0; }
.online-nudge .actions { margin-top: 16px; }
.preview-actions { padding: 0 15px 16px; font-size: 13px; }
.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.stat { min-height: 94px; display: flex; flex-direction: column; justify-content: center; padding: 16px 28px; border-right: 1px solid var(--line); color: var(--muted); font-size: 13px; }
.stat:first-child { padding-left: 0; }
.stat:last-child { border-right: 0; }
.stat strong { color: var(--ink); font-size: 25px; line-height: 1.2; }
.band { padding: 60px 0; border-bottom: 1px solid var(--line-soft); }
.band.alt { background: var(--surface); }
.feature-demo { padding: 56px 0; border-top: 1px solid var(--line-soft); border-bottom: 1px solid var(--line-soft); background: linear-gradient(180deg, #fbfcff 0%, #f6f8fb 100%); }
.feature-demo .inner { width: min(100% - 36px, 1280px); display: grid; grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr); gap: 36px; align-items: center; }
.feature-copy { max-width: 500px; }
.feature-copy h2 { font-size: 34px; }
.feature-copy p { margin: 0; }
.feature-copy .actions { margin-top: 24px; }
.feature-points { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin: 22px 0 0; }
.feature-point { padding: 12px 14px; border: 1px solid var(--line-soft); border-radius: 8px; background: white; color: #344054; font-size: 13px; font-weight: 700; }
.demo-frame { overflow: hidden; border: 1px solid var(--line); border-radius: 8px; background: #111827; box-shadow: 0 18px 42px rgba(24, 34, 48, 0.14); }
.demo-frame video { display: block; width: 100%; height: auto; aspect-ratio: 9 / 5; background: #111827; object-fit: contain; }
.demo-caption { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 14px; color: #d0d5dd; font-size: 12px; }
.demo-caption strong { color: white; font-size: 13px; }
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
  .choice-columns { grid-template-columns: 1fr; }
  .guide-list { grid-template-columns: 1fr; }
  .site-nav .inner { align-items: flex-start; flex-direction: column; gap: 12px; padding: 12px 0; }
  .site-nav { position: static; }
  .preview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  h1 { font-size: 44px; }
  .resource-list { grid-template-columns: 1fr; }
  .feature-demo .inner { grid-template-columns: 1fr; }
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
  .feature-demo { padding: 44px 0; }
  .feature-copy h2 { font-size: 28px; }
  .feature-points { grid-template-columns: 1fr; }
  .demo-caption { align-items: flex-start; flex-direction: column; gap: 4px; }
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
  return `${repoUrl}/blob/main/${file.split("/").map(encodeURIComponent).join("/")}`;
}

function downloadUrl(file) {
  return `https://raw.githubusercontent.com/HICV-CN/hicv-word-resume-templates/main/${file.split("/").map(encodeURIComponent).join("/")}`;
}

function guideLinks(selectedGuides = guides, prefix = "") {
  if (selectedGuides.length === 0) selectedGuides = [guides.find((guide) => guide.slug === "word-resume-pdf-checklist")];
  return `<div class="guide-list">${selectedGuides.map((guide) => `<article class="guide-item"><h3><a href="${prefix}guides/${guide.slug}/">${escapeHtml(guide.shortTitle)}</a></h3><p>${escapeHtml(guide.description)}</p><a class="text-link" href="${prefix}guides/${guide.slug}/">阅读全文 →</a></article>`).join("")}</div>`;
}

function onlineNudge(content, pathname = "/templates", prefix = "../../") {
  return `<aside class="online-nudge"><h3>认真准备这次投递，从合适的模板开始</h3><p>HICV 根据用户反馈持续打磨模板与编辑体验。想让关键经历呈现得更清楚，并继续完善内容、导出 PDF，可以先试在线模板。若招聘方要求 DOCX，或你需要离线精细调整，下方 Word 文件仍可直接下载。</p><div class="actions"><a class="button primary" href="${hicvUrl(content, "github_pages", pathname)}">先去 HICV 选模板</a><a class="text-link" href="${prefix}index.html#choose">比较在线模板与 Word 的利弊 →</a></div></aside>`;
}

function editingChoice() {
  return `<section class="band" id="choose"><div class="inner"><div class="section-head"><div><h2>在真实求职反馈中持续打磨的在线模板</h2><p class="section-intro">让经历清楚呈现，让内容便于完善，为每一次投递做好准备。</p></div></div><div class="trust-proof"><h3>持续打磨，有公开记录可查</h3><p>从模板预览到样式调整、PDF 与 PNG 导出，HICV 的公开日志记录了用户遇到的问题和产品改进。选择模板时，也看看它在实际使用中如何不断完善。</p><a href="${hicvUrl("home_choice_feedback", "github_pages", "/updates")}">查看用户反馈与迭代记录 →</a></div><div class="choice-columns"><div class="choice-option"><h3>HICV 在线模板</h3><p>适合希望快速选版式、在线完善内容并导出投递文件的用户。</p><ul><li><strong>换风格更方便：</strong>百变模板可组合头部、模块样式、配色与背景。</li><li><strong>内容与版式一起处理：</strong>在线编辑，可结合 AI 帮写整理表达，再自行核对事实。</li><li><strong>适合 PDF 投递：</strong>选择在线模板后导出，导出结果仍需逐页检查。</li><li><strong>需要考虑：</strong>依赖网络，保存与使用相关功能可能需要登录；高级模板和部分 AI 功能有会员或额度限制。</li></ul><div class="actions"><a class="button primary" href="${hicvUrl("home_comparison_online")}">先试 HICV 在线模板</a><a class="text-link" href="${hicvUrl("home_comparison_pricing", "github_pages", "/pricing")}">查看免费与会员权益 →</a></div></div><div class="choice-option"><h3>下载 Word / WPS 模板</h3><p>适合要求提交 DOCX、需要离线编辑或熟悉 Word 排版的用户。</p><ul><li><strong>离线可改：</strong>文件下载后，可在本地 Word 或 WPS 中编辑和保存。</li><li><strong>细节自由：</strong>可以自行调整表格、段落和页面布局，适应指定材料格式。</li><li><strong>仓库文件免费：</strong>使用与转发时请保留来源并遵守授权说明。</li><li><strong>需要考虑：</strong>替换长文本、跨设备打开或换模板时，可能需要手动处理字体、分页和对齐；内容整理与版本维护也需自行完成。</li></ul><div class="actions"><a class="button" href="catalog/">我需要 Word 文件</a></div></div></div><p class="choice-note">本仓库 DOCX 与 HICV 在线模板是两种资源，并非每份文件都有对应的在线版。需要提交 DOCX 时请优先选择 Word 文件；招聘方指定格式时以其要求为准。在线功能与费用以 <a href="${hicvUrl("home_comparison_terms", "github_pages", "/pricing")}">官网权益及账户内提示</a> 为准。</p></div></section>`;
}

function resourceBrowser(resourceFiles, category) {
  const nudge = category
    ? onlineNudge(`${category.slug}_before_download`, category.hicvPath)
    : onlineNudge("catalog_before_download", "/templates", "../");
  return `${nudge}<div data-resource-browser><div class="resource-toolbar"><label class="sr-only" for="resource-search">搜索模板名称、分类或岗位</label><input id="resource-search" class="resource-search" data-resource-search type="search" placeholder="搜索名称、分类或岗位，如：会计 单页"><p class="resource-summary" role="status">找到 <strong data-resource-count>${resourceFiles.length}</strong> 套，已显示 <strong data-resource-shown>${resourceFiles.length}</strong> 套</p></div><div class="resource-list">${resourceFiles.map((file, index) => `<div class="resource-row" data-resource-row data-search="${escapeHtml(rel(file))}"><span class="resource-number">${index + 1}</span><span class="resource-name">${escapeHtml(titleFromFile(file))}<span class="preview-meta">${escapeHtml(categoryFromFile(file).replace(/^\d+_/, ""))} · <a href="${repoFileUrl(rel(file))}" aria-label="查看 ${escapeHtml(titleFromFile(file))} GitHub 文件页">GitHub 文件页</a></span></span><a href="${downloadUrl(rel(file))}" aria-label="下载 ${escapeHtml(titleFromFile(file))} DOCX">下载 DOCX</a></div>`).join("")}</div><p data-resource-empty hidden>没有匹配的模板，试试减少关键词或搜索岗位名称。</p><div class="actions"><button class="button" type="button" data-resource-more hidden>再显示 60 套</button></div></div>`;
}

function navHtml(prefix = "") {
  return `<nav class="site-nav"><div class="inner">
    <a class="brand" href="${prefix}index.html"><img class="brand-logo" src="${prefix}assets/hicv-logo.png" alt="HICV"><span>HICV Word 简历模板库</span></a>
    <div class="nav-links">
      <a href="${prefix}index.html#previews">精选预览</a>
      <a href="${prefix}index.html#baibian">百变模板</a>
      <a href="${prefix}index.html#categories">模板分类</a>
      <a href="${prefix}index.html#scenarios">求职场景</a>
      <a href="${prefix}catalog/">搜索模板</a>
      <a href="${prefix}index.html#guides">简历指南</a>
      <a class="nav-cta" href="${hicvUrl("nav_online_templates")}">在线制作简历</a>
    </div>
  </div></nav>`;
}

function previewGrid(items, assetPrefix = "", compact = false) {
  return `<div class="preview-grid${compact ? " compact" : ""}">${items.map((item) => `<figure class="preview">
    <a class="preview-stage" href="${repoFileUrl(item.file)}"><img src="${assetPrefix}assets/previews/${item.image}" alt="${escapeHtml(item.title)}预览" width="520" height="729" loading="lazy"></a>
    <figcaption><span class="preview-title">${escapeHtml(item.title)}<span class="preview-meta">真实 DOCX 渲染 · Word / WPS</span></span><a class="preview-open" href="${repoFileUrl(item.file)}">查看文件 →</a></figcaption>
    <div class="preview-actions"><a href="${hicvUrl(`preview_${path.basename(item.image, ".jpg")}_online`)}">想在线换版式？去 HICV 选模板 →</a></div>
  </figure>`).join("")}</div>`;
}

function pageShell({ title, description, canonical, body, prefix = "", schema, ogType = "website" }) {
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
  <meta property="og:type" content="${ogType}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:updated_time" content="${updatedAt}T00:00:00+08:00">
  <meta property="og:image" content="${pagesUrl}/assets/social-preview.png">
  <meta property="og:image:width" content="1280">
  <meta property="og:image:height" content="640">
  <link rel="icon" type="image/png" href="${prefix}assets/hicv-logo.png">
  <link rel="stylesheet" href="${prefix}assets/site.css?v=${createHash("sha256").update(siteCss).digest("hex").slice(0, 12)}">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
  ${navHtml(prefix)}
  ${body}
  <footer><div class="inner"><p>由 <a href="${hicvUrl("footer_brand")}">HICV.cn</a> 整理维护 · 2,132 套真实可编辑 Word 简历模板</p><div class="footer-links"><a href="${repoUrl}">GitHub 仓库</a><a href="${repoUrl}/releases">精选下载</a></div></div></footer>
  <script>
    document.querySelectorAll("[data-resource-browser]").forEach((browser) => {
      const input = browser.querySelector("[data-resource-search]");
      const rows = [...browser.querySelectorAll("[data-resource-row]")];
      const count = browser.querySelector("[data-resource-count]");
      const shown = browser.querySelector("[data-resource-shown]");
      const more = browser.querySelector("[data-resource-more]");
      const empty = browser.querySelector("[data-resource-empty]");
      let limit = 60;
      function render() {
        const keywords = input.value.trim().toLocaleLowerCase().split(/\\s+/).filter(Boolean);
        let matched = 0;
        rows.forEach((row) => {
          const matches = keywords.every((word) => row.dataset.search.toLocaleLowerCase().includes(word));
          if (matches) matched += 1;
          row.hidden = !matches || matched > limit;
        });
        count.textContent = matched;
        shown.textContent = Math.min(matched, limit);
        more.hidden = matched <= limit;
        empty.hidden = matched !== 0;
      }
      input.addEventListener("input", () => { limit = 60; render(); });
      more.addEventListener("click", () => { limit += 60; render(); });
      render();
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
      <div><h3>${category.shortTitle}</h3><p>${category.description}</p><p><a href="${hicvUrl(`${category.slug}_home_category`, "github_pages", category.hicvPath)}">去 HICV 在线制作简历 →</a></p></div>
      <a class="category-link" href="categories/${category.slug}/index.html">${categoryFiles.length} 套模板 →</a>
    </article>`;
  }).join("");
}

const categoryCards = categoryCardsFor(landingCategories);
const scenarioCards = categoryCardsFor([...scenarioCategories, ...additionalRoleCategories], landingCategories.length);
const styleCards = categoryCardsFor(styleCategories, landingCategories.length + scenarioCategories.length + additionalRoleCategories.length);

const featuredFiles = landingCategories.flatMap((category) => files.filter((file) => rel(file).startsWith(category.prefix)).slice(0, 4));
const homeRows = featuredFiles.slice(0, 12).map((file, index) => `<div class="resource-row"><span class="resource-number">${String(index + 1).padStart(2, "0")}</span><span class="resource-name">${escapeHtml(titleFromFile(file))}</span><a href="${downloadUrl(rel(file))}">下载 DOCX</a></div>`).join("");

const homeBody = `<header class="hero"><div class="inner">
  <div class="hero-copy">
    <p class="eyebrow">HICV · 根据真实求职反馈持续打磨</p>
    <h1>HICV 简历模板与 Word 模板库</h1>
    <p class="hero-promise">每一次来之不易的求职机会，都值得一份认真准备的简历。</p>
    <p class="lead">让关键经历被清楚看见，让投递前的准备更充分。HICV 根据用户反馈持续改进模板预览、样式调整与导出体验，帮助你把精力放在经历表达与岗位匹配上。先试在线模板，也可下载本库 2,132 套 Word 模板。</p>
    <p><a href="${hicvUrl("home_trust_updates", "github_pages", "/updates")}">查看用户反馈与公开迭代记录 →</a></p>
    <div class="actions">
      <a class="button primary" href="${hicvUrl("home_primary_cta")}">用 HICV 认真准备这次投递</a>
      <a class="button" href="catalog/">搜索全部 ${files.length} 套 Word 模板</a>
    </div>
    <div class="quick-links"><a href="#choose">在线模板与 Word 怎么选</a><a href="#styles">更多页数与风格</a><a href="guides/campus-resume-checklist/">2027 届秋招投递检查</a><a href="guides/resume-without-internship/">没有实习经历怎么写</a><a href="guides/word-resume-pdf-checklist/">Word 转 PDF 检查</a></div>
  </div>
  <div class="stats"><div class="stat"><strong>${files.length.toLocaleString("zh-CN")}</strong><span>套可编辑 DOCX</span></div><div class="stat"><strong>${grouped.size}</strong><span>个资源分类</span></div><div class="stat"><strong>Word / WPS</strong><span>下载后直接编辑</span></div></div>
</div></header>
<main>
  <section class="feature-demo" id="baibian"><div class="inner">
    <div class="feature-copy">
      <p class="eyebrow">HICV 百变模板</p>
      <h2>一份简历内容，快速换出不同投递风格</h2>
      <p class="lead">百变模板支持自由组合头部布局与模块样式，细调主题配色和页面背景。从简约清爽到正式商务，用同一份内容搭出更适合岗位和行业的简历版式。</p>
      <div class="feature-points"><span class="feature-point">头部布局可切换</span><span class="feature-point">模块样式可组合</span><span class="feature-point">主题配色可细调</span><span class="feature-point">适合国内投递场景</span></div>
      <div class="actions"><a class="button primary" href="${hicvUrl("home_baibian_cta")}">去试试百变模板</a><a class="button" href="${baibianVideoUrl}">打开演示视频</a></div>
    </div>
    <div class="demo-frame">
      <video src="${baibianVideoUrl}" width="900" height="500" muted autoplay loop playsinline controls preload="metadata" aria-label="HICV 百变模板功能演示视频"></video>
      <div class="demo-caption"><strong>百变模板演示</strong><span>在 HICV 模板列表页进入，可组合头部、模块、配色与背景。</span></div>
    </div>
  </div></section>
  ${editingChoice()}
  <section class="band alt" id="previews"><div class="inner"><div class="section-head"><div><h2>精选模板预览</h2><p class="section-intro">全部由仓库中的真实 DOCX 直接渲染，保持原始版式比例，不使用示意图。</p></div><a class="text-link" href="${repoUrl}/tree/main/templates">浏览全部文件 →</a></div>${previewGrid(previewItems.filter((item) => item.featured !== false))}</div></section>
  <section class="band" id="categories"><div class="inner"><div class="section-head"><div><h2>按模板类型选择</h2><p class="section-intro">按页数、版式和岗位选择，找到适合自己经历长度的模板。</p></div></div><div class="category-grid">${categoryCards}</div></div></section>
  <section class="band alt" id="scenarios"><div class="inner"><div class="section-head"><div><h2>按求职场景选择</h2><p class="section-intro">围绕秋招、实习和热门行业整理现有模板，方便直接进入更具体的搜索入口。</p></div></div><div class="category-grid">${scenarioCards}</div></div></section>
  <section class="band" id="styles"><div class="inner"><div class="section-head"><div><h2>更多页数、风格与配套材料</h2><p class="section-intro">从双页简历到创意风格，也有封面与求职信；按实际投递需要选择。</p></div></div><div class="category-grid">${styleCards}</div></div></section>
  <section class="band" id="guides"><div class="inner"><div class="section-head"><div><h2>简历写作与投递指南</h2><p class="section-intro">从真实经历到可投递的文件，把下载模板后的几步也准备好。</p></div></div>${guideLinks()}</div></section>
  <section class="band alt"><div class="inner"><div class="section-head"><div><h2>Word 模板快速下载</h2><p class="section-intro">从简约、表格与职业分类中选取的 12 份模板。</p></div><a class="text-link" href="catalog/">搜索完整模板库 →</a></div><div class="resource-list">${homeRows}</div></div></section>
  <section class="conversion"><div class="inner"><div><h2>下一次投递，值得更充分的准备</h2><p>用清晰的版式呈现真实能力，认真核对每一段经历，把握来之不易的求职机会。</p></div><div class="actions"><a class="button primary" href="${hicvUrl("home_bottom_cta")}">用 HICV 准备投递简历</a><a class="button" href="${repoUrl}/releases">下载精选包</a></div></div></section>
</main>`;

const homeHtml = pageShell({
  title: "Word 简历模板免费下载_2027届秋招与应届生简历_HICV",
  description: `免费搜索 ${files.length} 套 Word 简历模板，覆盖校招、实习、行业岗位与英文简历。2026 年 10 月更新：2027 届秋招检查清单、无实习经历写法、Word 排版与 PDF 导出指南，也可进入 HICV 在线制作。`,
  canonical: `${pagesUrl}/`,
  body: homeBody,
  schema: {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "HICV Word 简历模板库",
        description: `HICV 整理的 ${files.length} 套可编辑 Word 简历模板，包含百变模板在线组合入口。`,
        url: `${pagesUrl}/`,
        dateModified: updatedAt,
        keywords: ["Word 简历模板", "百变模板", "秋招简历", "校招简历", "实习简历", "行业简历"],
        creator: { "@type": "Organization", name: "HICV.cn", url: "https://hicv.cn" },
        license: `${repoUrl}/blob/main/LICENSE`,
      },
      {
        "@type": "VideoObject",
        name: "HICV 百变模板功能演示",
        description: "演示 HICV 百变模板如何自由组合简历头部布局、模块样式、主题配色和页面背景。",
        contentUrl: baibianVideoUrl,
        uploadDate: "2026-09-15",
        publisher: { "@type": "Organization", name: "HICV.cn", url: "https://hicv.cn" },
      },
    ],
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
  const categoryDirectoryUrl = category.prefix
    ? `${repoUrl}/tree/main/${encodeURI(category.prefix.replace(/\/$/, ""))}`
    : `${repoUrl}/tree/main/templates`;
  const body = `<header class="hero"><div class="inner"><p class="breadcrumbs"><a href="../../index.html">模板库首页</a> / ${category.shortTitle}</p><div class="hero-copy"><p class="eyebrow">HICV 求职模板专题</p><h1>${category.title}</h1><p class="lead">${category.description}</p><p class="updated">更新于 <time datetime="${updatedAt}">${updatedAt}</time></p><div class="actions"><a class="button primary" href="${hicvUrl(`${category.slug}_primary`, "github_pages", category.hicvPath)}">在线浏览同类模板</a><a class="button" href="#downloads">选择 Word 文件</a></div></div><div class="stats"><div class="stat"><strong>${categoryFiles.length}</strong><span>套可编辑模板</span></div><div class="stat"><strong>DOCX</strong><span>Word / WPS 可用</span></div><div class="stat"><strong>免费</strong><span>仓库 Word 文件下载</span></div></div></div></header>
  <main>${previewSection}<section class="band" id="downloads"><div class="inner"><div class="section-head"><div><h2>${category.shortTitle}下载目录</h2><p class="section-intro">共 ${categoryFiles.length} 套模板，搜索覆盖本专题的全部文件。</p></div><a class="text-link" href="../../catalog/">搜索所有分类 →</a></div>${resourceBrowser(categoryFiles, category)}<div class="actions"><a class="button" href="${categoryDirectoryUrl}">查看仓库文件</a><a class="button primary" href="${hicvUrl(`${category.slug}_bottom`, "github_pages", category.hicvPath)}">在线套用模板</a></div></div></section><section class="band alt"><div class="inner"><div class="section-head"><h2>下载之后，继续完善简历</h2></div>${guideLinks(guides.filter((guide) => guide.categories.includes(category.slug)), "../../")}</div></section><section class="conversion"><div class="inner"><div><h2>不用从空白文档开始</h2><p>在线选择同类模板，继续完善简历内容并导出投递版本。</p></div><div class="actions"><a class="button primary" href="${hicvUrl(`${category.slug}_conversion`, "github_pages", category.hicvPath)}">在线制作简历</a></div></div></section></main>`;
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

const catalogDir = path.join(docsDir, "catalog");
await fs.mkdir(catalogDir, { recursive: true });
await fs.writeFile(path.join(catalogDir, "index.html"), pageShell({
  title: `${files.length} 套 Word 简历模板搜索与免费下载_HICV`,
  description: "按模板名称、分类和岗位搜索完整 Word 简历库，包含简约、表格、实习、教师、会计、开发、英文与考研复试模板，支持 Word / WPS 编辑。",
  canonical: `${pagesUrl}/catalog/`,
  prefix: "../",
  body: `<header class="hero"><div class="inner"><p class="breadcrumbs"><a href="../index.html">模板库首页</a> / 全部模板</p><div class="hero-copy"><h1>Word 简历模板搜索</h1><p class="lead">${files.length} 套可编辑 DOCX，按名称、分类或岗位找到适合自己的模板。</p><div class="actions"><a class="button primary" href="${hicvUrl("catalog_primary")}">去 HICV 在线制作</a><a class="button" href="${repoUrl}/blob/main/TEMPLATE_INDEX.md">查看 Markdown 索引</a></div></div></div></header><main><section class="band"><div class="inner">${resourceBrowser(files)}</div></section><section class="band alt"><div class="inner"><div class="section-head"><h2>模板选好后，准备投递内容</h2></div>${guideLinks(guides, "../")}</div></section></main>`,
  schema: { "@context": "https://schema.org", "@type": "CollectionPage", name: "Word 简历模板搜索", url: `${pagesUrl}/catalog/`, dateModified: updatedAt },
}));

for (const guide of guides) {
  const canonical = `${pagesUrl}/guides/${guide.slug}/`;
  const sections = guide.sections.map((section, index) => `<section id="section-${index + 1}"><h2>${escapeHtml(section.title)}</h2>${(section.paragraphs ?? []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${section.items ? `<ul>${section.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}${section.example ? `<blockquote><p>${escapeHtml(section.example)}</p></blockquote>` : ""}</section>`).join("");
  const relatedCategories = allLandingCategories.filter((category) => guide.categories.includes(category.slug));
  const body = `<header class="hero"><div class="inner reading"><p class="breadcrumbs"><a href="../../index.html">模板库首页</a> / 简历指南</p><div class="hero-copy"><p class="eyebrow">HICV 简历指南</p><h1>${escapeHtml(guide.title)}</h1><p class="lead">${escapeHtml(guide.description)}</p><p class="updated">HICV 编辑整理 · 更新于 <time datetime="${updatedAt}">${updatedAt}</time></p><nav class="guide-toc" aria-label="文章目录">${guide.sections.map((section, index) => `<a href="#section-${index + 1}">${escapeHtml(section.title)}</a>`).join("")}</nav></div></div></header><main><article class="band"><div class="inner reading">${sections}</div></article><section class="band alt"><div class="inner reading"><h2>选择一份配套模板</h2><p>Word 文件可下载到本地编辑；在线模板可在 HICV 中继续制作。</p><ul>${relatedCategories.map((category) => `<li><a href="../../categories/${category.slug}/">${category.title}</a></li>`).join("")}</ul><div class="actions"><a class="button primary" href="${hicvUrl(`guide_${guide.slug}_templates`, "github_pages", guide.hicvPath)}">${guide.cta}</a><a class="button" href="${hicvUrl(`guide_${guide.slug}_examples`, "github_pages", "/fanwen")}">参考岗位简历范文</a></div></div></section><section class="band"><div class="inner"><div class="section-head"><h2>继续阅读</h2></div>${guideLinks(guides.filter((item) => item.slug !== guide.slug), "../../")}</div></section></main>`;
  const guideDir = path.join(docsDir, "guides", guide.slug);
  await fs.mkdir(guideDir, { recursive: true });
  await fs.writeFile(path.join(guideDir, "index.html"), pageShell({
    title: `${guide.title}_HICV`, description: guide.description, canonical, body, prefix: "../../", ogType: "article",
    schema: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Article", headline: guide.title, description: guide.description, mainEntityOfPage: canonical, datePublished: "2026-10-14", dateModified: updatedAt, inLanguage: "zh-CN", author: { "@type": "Organization", name: "HICV", url: "https://hicv.cn" }, publisher: { "@type": "Organization", name: "HICV", url: "https://hicv.cn" } },
        { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "模板库首页", item: `${pagesUrl}/` }, { "@type": "ListItem", position: 2, name: guide.shortTitle, item: canonical }] },
      ],
    },
  }));
}

await fs.writeFile(path.join(docsDir, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${pagesUrl}/sitemap.xml\n`);
const sitemapUrls = [`${pagesUrl}/`, `${pagesUrl}/catalog/`, ...allLandingCategories.map((category) => `${pagesUrl}/categories/${category.slug}/`), ...guides.map((guide) => `${pagesUrl}/guides/${guide.slug}/`)];
await fs.writeFile(path.join(docsDir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url, index) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${updatedAt}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${index === 0 ? "1.0" : "0.8"}</priority>\n  </url>`).join("\n")}\n</urlset>\n`);

console.log(`Generated ${files.length} templates, ${allLandingCategories.length} category pages, ${guides.length} guides, and the complete searchable catalog.`);
