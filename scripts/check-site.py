#!/usr/bin/env python3
"""Validate static local links, image declarations and Notes metadata (stdlib only)."""
import json
import re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ORIGIN = 'nowhere.pudan.me'
errors = []
fragments = []


def resolve(value, source):
    url = urlsplit(value)
    if url.scheme not in ('', 'http', 'https') or (url.netloc and url.netloc != ORIGIN):
        return None
    path = unquote(url.path)
    target = ROOT / path.lstrip('/') if path.startswith('/') else source.parent / path
    if not path:
        target = source
    if target.is_dir():
        target /= 'index.html'
    if not target.exists():
        errors.append(f'{source.relative_to(ROOT)}: missing {value}')
    if url.fragment and target.suffix == '.html':
        fragments.append((target.resolve(), unquote(url.fragment), source))
    return target


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.meta, self.links, self.schemas = path, {}, {}, []
        self.ids = set()
        self.json_text = None
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a:
            self.ids.add(a['id'])
        if tag == 'meta':
            self.meta[a.get('property', a.get('name'))] = a.get('content')
        if tag == 'link':
            self.links[a.get('rel')] = a.get('href')
        for key in ('href', 'src', 'poster'):
            if key in a:
                resolve(a[key], self.path)
        if 'srcset' in a:
            for item in a['srcset'].split(','):
                resolve(item.strip().split()[0], self.path)
        if tag == 'img' and 'blog' in self.path.parts:
            for key in ('alt', 'width', 'height'):
                if key not in a:
                    errors.append(f'{self.path.relative_to(ROOT)}: image missing {key}')
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.json_text = ''

    def handle_data(self, text):
        if self.json_text is not None:
            self.json_text += text

    def handle_endtag(self, tag):
        if tag == 'script' and self.json_text is not None:
            try:
                self.schemas.append(json.loads(self.json_text))
            except json.JSONDecodeError as error:
                errors.append(f'{self.path}: invalid schema: {error}')
            self.json_text = None


pages = [Page(p) for p in ROOT.rglob('*.html') if not {'outputs', '.git'} & set(p.relative_to(ROOT).parts)]
by_path = {page.path.resolve(): page for page in pages}
for target, fragment, source in fragments:
    if target in by_path and fragment not in by_path[target].ids:
        errors.append(f'{source.relative_to(ROOT)}: missing fragment #{fragment} in {target.name}')
for page in pages:
    if 'blog' not in page.path.parts:
        continue
    canonical = page.links.get('canonical')
    if not canonical or page.meta.get('og:url') != canonical:
        errors.append(f'{page.path}: canonical/OG URL mismatch')
    for key in ('og:image', 'twitter:image', 'twitter:card', 'description'):
        if not page.meta.get(key):
            errors.append(f'{page.path}: missing {key}')
    is_index = page.path == ROOT / 'blog/index.html'
    expected = 'CollectionPage' if is_index else 'BlogPosting'
    if len(page.schemas) != 1 or page.schemas[0].get('@type') != expected:
        errors.append(f'{page.path}: expected {expected} schema')
        continue
    if page.meta.get('og:type') != ('website' if is_index else 'article'):
        errors.append(f'{page.path}: wrong og:type')
    if not is_index:
        schema = page.schemas[0]
        text = page.path.read_text()
        date = re.search(r'<time datetime="([^"]+)"', text).group(1)
        if schema.get('datePublished') != date or schema.get('headline') != page.meta.get('og:title'):
            errors.append(f'{page.path}: visible/schema date or title mismatch')
for css in ROOT.rglob('*.css'):
    if 'outputs' in css.parts:
        continue
    for value in re.findall(r'url\([\'"]?([^\)\'"\s]+)', css.read_text()):
        resolve(value, css)
ET.parse(ROOT / 'blog/feed.xml')
sitemap = ET.parse(ROOT / 'sitemap.xml')
for location in sitemap.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
    resolve(location.text, ROOT / 'index.html')
if errors:
    raise SystemExit('\n'.join(errors))
print(f'PASS: {len(pages)} HTML pages; local links/resources, CSS URLs, Notes metadata/schema, RSS and sitemap')
