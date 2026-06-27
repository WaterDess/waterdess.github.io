# Global Change Hydrology Group Website

This folder contains the GitHub Pages website for the Global Change Hydrology Group.

The website is separate from `tv-showcase/`:

- `tv-showcase/`: offline, full-screen TV display with automatic looping.
- `github-pages-site/`: public website with independent pages, navigation, profile pages, news, and publications.

## Current Structure

```text
index.html          # Home
about.html          # About
people.html         # People
research.html       # Research
publications.html   # Publications
news.html           # News
join.html           # How to join?
contact.html        # Contact page
person-*.html       # Member profile pages
data/site.js        # Editable site content
public/assets/      # Local images, SVG visuals, and PDF assets
styles.css          # Site styles
app.js              # Static rendering logic
```

## Local Preview

Open `index.html` directly in a browser, or run a local static server:

```bash
python -m http.server 8123
```

Then visit:

```text
http://127.0.0.1:8123/index.html
```

## Editing Content

Most editable content is stored in:

```text
data/site.js
```

Editable content includes:

- Group name and summary
- People and profile fields
- Research cards
- Publications
- News
- How to join information
- Local visual assets

## Visual Direction

The current design is an English-only, image-led academic lab website:

- Large hydrosphere hero visual
- Three homepage entry cards for Research, News, and Publications
- Clean white background
- Minimal UI decoration
- Local offline assets only

## Deployment

This is a pure static site. Push the folder contents to the configured GitHub Pages repository and serve from the main branch root.
