"""Check generated page links, structured data, and complete DOCX coverage."""

import json
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
BASE = "https://hicv-cn.github.io/hicv-word-resume-templates/"


class Page(HTMLParser):
    def __init__(self, file):
        super().__init__(convert_charrefs=True)
        self.file = file
        self.url = BASE + file.relative_to(DOCS).as_posix().removesuffix("index.html")
        self.links = []
        self.ids = set()
        self.h1_count = 0
        self.canonical = None
        self.rows = []
        self.schemas = []
        self.schema_text = None
        self.feed(file.read_text(encoding="utf-8"))

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if "id" in attrs:
            assert attrs["id"] not in self.ids, f"Duplicate ID: {self.file}"
            self.ids.add(attrs["id"])
        if tag == "h1":
            self.h1_count += 1
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs["href"]
        for key in ("href", "src"):
            if key in attrs:
                self.links.append(urljoin(self.url, attrs[key]))
        if "data-resource-row" in attrs:
            self.rows.append(attrs["data-search"])
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.schema_text = ""

    def handle_data(self, data):
        if self.schema_text is not None:
            self.schema_text += data

    def handle_endtag(self, tag):
        if tag == "script" and self.schema_text is not None:
            self.schemas.append(json.loads(self.schema_text))
            self.schema_text = None


pages = [Page(file) for file in sorted(DOCS.rglob("*.html"))]
by_file = {page.file.resolve(): page for page in pages}
home_links = {url.removesuffix("index.html") for url in by_file[(DOCS / "index.html").resolve()].links}
checked_downloads = set()
for page in pages:
    assert page.h1_count == 1, f"Expected one H1: {page.file}"
    assert page.canonical == page.url, f"Invalid canonical: {page.file}"
    assert page.schemas, f"Missing structured data: {page.file}"
    assert len(page.rows) == len(set(page.rows)), f"Duplicate template: {page.file}"
    if page.file.is_relative_to(DOCS / "categories"):
        assert page.rows, f"Empty category: {page.file}"
        assert page.canonical in home_links, f"Category missing from homepage: {page.file}"
    for link in page.links:
        url = urlsplit(link)
        if link.startswith(BASE):
            relative = unquote(url.path.removeprefix(urlsplit(BASE).path))
            target = DOCS / relative
            if target.is_dir():
                target = target / "index.html"
            assert target.is_file(), f"Broken internal link: {page.file}: {link}"
            if url.fragment:
                assert unquote(url.fragment) in by_file[target.resolve()].ids, link
        elif url.netloc == "raw.githubusercontent.com":
            prefix = "/HICV-CN/hicv-word-resume-templates/main/"
            assert url.path.startswith(prefix), link
            relative = unquote(url.path.removeprefix(prefix))
            assert (ROOT / relative).is_file(), f"Missing DOCX: {relative}"
            checked_downloads.add(relative)
        elif url.netloc == "hicv.cn":
            # Structured data URLs are not links; user-facing links carry attribution.
            assert "utm_source=" in url.query and "utm_content=" in url.query, link

expected = {
    file.relative_to(ROOT).as_posix()
    for file in (ROOT / "templates").rglob("*.docx")
    if not file.name.startswith(("._", "~$"))
}
catalog = by_file[(DOCS / "catalog/index.html").resolve()]
assert set(catalog.rows) == expected, "Catalog does not cover every DOCX"
assert checked_downloads == expected, "Missing direct download links"
sitemap = ET.parse(DOCS / "sitemap.xml")
urls = [node.text for node in sitemap.findall(".//{*}loc")]
assert len(urls) == len(set(urls)), "Duplicate sitemap URL"
assert set(urls) == {page.canonical for page in pages}, "Sitemap/page mismatch"
print(f"Verified {len(pages)} pages, internal links, JSON-LD, sitemap and {len(expected)} DOCX downloads.")
