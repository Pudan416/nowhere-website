# Nowhere website

Public static website at https://nowhere.pudan.me/, served by GitHub Pages from `main` at the repository root.

The landing includes three complete day themes with a New Day button and random opening, native phone demonstrations, interactive moment previews, supplied day posters and three supplied music samples.

New Day randomly selects one of the other two themes.

Music order: coral / Soft Geometry, blue / Living Circuit, peach / Electric Ritual. Audio starts manually; one track plays at a time.

`privacy.html` and `terms.html` retain their existing legal text and layout. Their broken legacy icon links now use the landing’s SVG favicon. `CNAME` retains the custom domain. `.nojekyll` publishes the static files directly.

Fonts ship with their OFL licenses in `assets/`. Public PNG copies preserve every rendering chunk while omitting source-path text metadata. Source review/provenance records remain in the private authoring project.

To preview locally, run `python3 -m http.server 4179` from this directory.

## Notes blog

`/blog/` contains eight static articles with the landing's local Onest and Nowhere fonts. Article prose, titles, slugs and imported publication dates are preserved. The index, article navigation and reading layout have their own stylesheet; landing themes and New Day remain independent.

Original WebP images remain in `blog/assets/`. Generated `-w320`, `-w640` and (where the original is large enough) `-w1280` WebP renditions preserve each full image's aspect ratio. Index thumbnails use 320/640px sources; articles select 320/640/1280px sources. Dimensions reserve space, and images load lazily. Keep originals when regenerating image sizes.

Each article has a canonical URL, Open Graph/Twitter image metadata and `BlogPosting` JSON-LD. The index uses `CollectionPage` and `og:type=website`. `/blog/feed.xml`, `/robots.txt` and `/sitemap.xml` support discovery. Dates are publication dates, not deployment timestamps; do not add `dateModified` or sitemap `lastmod` without a real content change. **Unresolved source discrepancy:** “iOS Screen-Time Apps for Creatives (2026)” retains its imported May 28, 2019 date pending author/source confirmation.

GitHub Pages publishes the repository root from `main`. Run `python3 scripts/check-site.py` to check local resources, links, Notes metadata, JSON-LD, RSS and sitemap without installing dependencies. Before publishing, preview the index and an article at desktop and narrow phone widths, check local resources and structured data, and preserve all article body text. After pushing, verify the Pages deployment and the public canonical URLs. The original blog was https://www.pudan.me/blog. Permanent redirects from its `/blog` index and each existing article slug to the equivalent `https://nowhere.pudan.me/blog/` URL must be configured at the original host; destination metadata does not implement a redirect. The cached original index also shows June 25 for “329 installs” while imported metadata says June 24; the imported date is preserved until the original timezone/date is confirmed.

## Website analytics

The site uses a GA4 web stream (`G-HX6C8CTSVR`) for `https://nowhere.pudan.me`. Every HTML page loads the shared `analytics.js`; optional analytics stay off until a visitor chooses “Allow analytics”. The choice can be changed with “Cookie settings” in the footer. GA4 Enhanced Measurement records page views, scrolls, and outbound link clicks after consent. The Google tag is loaded once per page and can be checked in Analytics Realtime.
