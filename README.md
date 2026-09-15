# Global Change Hydrology Group Website

Static GitHub Pages website for the Global Change Hydrology Group at Tsinghua University.

Live site: <https://waterdess.github.io/>

## Structure

```text
index.html                 Home entry
about/, news/, people/     Clean-route page entries
person-*/                  Member profile entries
data/site.js               Site content
site.css                   Site styles
site.js                    Rendering and route logic
public/assets/             Images, documents, and archived themes
```

The root-level `*.html` files support direct local preview. Matching route folders support clean GitHub Pages URLs such as `/news/` and `/people/`.

## Development

This project has no build step, backend, package manager, or online runtime dependency.

Most content changes belong in `data/site.js`. Visual changes belong in `site.css`, and rendering changes belong in `site.js`.

Run a local server from this directory:

```powershell
python -m http.server 8123
```

Then open <http://127.0.0.1:8123/>.

Validate JavaScript before deployment:

```powershell
node --check site.js
node --check data/site.js
git diff --check
```

## Assets

The homepage uses `public/assets/home-earth-static.jpg`. The previous mountain homepage image is intentionally retained under `public/assets/themes/mountain/` as an inactive theme backup.

Production pages should use local assets only. Add new images and PDFs under `public/assets/` and reference them from `data/site.js`.

## Deployment

The repository publishes the `main` branch through GitHub Pages. There is no generated output directory; committed files are the deployed site.

## Refresh browser assets before deployment

After editing `site.js`, `site.css`, or `data/site.js`, run:

```powershell
python scripts/refresh-static-assets.py
```

This creates content-addressed copies and updates every HTML entry shell to load a matching release. Commit the updated shells and generated assets together with the source changes. Keep previous generated assets available for browsers with an older cached HTML page. Page URLs remain unchanged and use no cache-busting query parameters.

## Shared visual styles

Reuse existing page templates and shared interaction styles for new content. Education uses the Publications listing template. Education and SRT use neutral resting text while inheriting the site's existing link hover color and glow; do not replace them with page-specific hover behavior.
