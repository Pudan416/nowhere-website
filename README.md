# Nowhere website

Public static website at https://nowhere.pudan.me/, served by GitHub Pages from `main` at the repository root.

The landing includes three complete day themes with a swatch selector and random opening, native phone demonstrations, interactive moment previews, supplied day posters and three supplied music samples.

Music order: coral / Soft Geometry, blue / Living Circuit, peach / Electric Ritual. Audio starts manually; one track plays at a time.

`privacy.html` and `terms.html` retain their existing legal text and layout. Their broken legacy icon links now use the landing’s SVG favicon. `CNAME` retains the custom domain. `.nojekyll` publishes the static files directly.

Fonts ship with their OFL licenses in `assets/`. Public PNG copies preserve every rendering chunk while omitting source-path text metadata. Source review/provenance records remain in the private authoring project.

To preview locally, run `python3 -m http.server 4179` from this directory.
