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

The Summer Training carousel starts automatically with a five-second interval. Keep the arrows and centered slide selectors; do not add a separate Play/Pause button. Manual navigation restarts the five-second interval, including while the pointer or keyboard focus remains on the carousel. Pause rotation while a photo viewer is open or the tab is hidden; respect reduced-motion preferences.

Reuse `renderPeopleBlockHeading()` and `.people-block-heading` for numbered section headings in People, Research, Education and How to join?. Its heading size is shared at `1rem`, at least as large as the list item titles. Research, Education and How to join? item titles use regular weight.

The completed 2026 Summer Training page is an English event retrospective with a four-photo carousel showing only group photos, faded neighboring previews, and direct slide selectors. All 24 supplied photos are grouped in this order: Workshop sessions, Completion memories, Group photos. The original handbook is a downloadable PDF and the source for the brief schedule introduction. Photo viewing supports keyboard navigation; automatic rotation resumes five seconds after manual navigation and respects reduced-motion preferences. Keep visible copy factual and concise, with descriptive image alt text. Only the three research themes use Roman numerals; the main sections retain 01–04. Content and photo metadata are in `summerTraining`; event assets are under `public/assets/summer-2026/`.

Reuse existing page templates and shared interaction styles for new content. Education and How to join? share the Ongoing / Archive listing renderer and News item format, with newer items first within each group. Both use the Research/People numbered section headings (01 Ongoing, 02 Archive), with the same normal text colors in both groups. Group headings are at least as large as item titles. Show only category, date and the linked, regular-weight title; omit summary paragraphs on these two listing pages. Education item dates identify first publication on this website. Set `status: "archive"` for completed education programs. Education and SRT use neutral resting text while inheriting the site's existing link hover color and glow; do not replace them with page-specific hover behavior.
