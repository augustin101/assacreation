# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Static website for **Assa Créations** — a handmade clothing and jewellery shop. Replaces an existing Wix site. Hosted on GitHub Pages with a custom domain (`assacreation.com`). Everything is in French.

**No build pipeline.** No Node, no npm, no compilation. Files open directly in the browser.

## Local Development

Serve locally with Python (needed for ES module imports to work across files):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Architecture

```
index.html / couture.html / bijoux.html / commander.html / a-propos.html
       ↓ fetch                                    ↓ fetch
  data/*.json  ←──── source of truth for products/fabrics ────→  js/catalogue.js (renders grids)
                                                                   js/order-form.js (dynamic form)
css/tokens.css  ←── all CSS variables (colours, fonts, spacing)
css/main.css    ←── all page styles, imports tokens.css
```

### Key files

- **`css/tokens.css`** — single source for the design system (colours, fonts, spacing as CSS custom properties). Change palette here.
- **`js/catalogue.js`** — fetches JSON data and renders product/fabric grids dynamically via DOM manipulation.
- **`js/order-form.js`** — drives `commander.html`: toggles couture/bijoux form sections, populates dropdowns from JSON, handles fabric thumbnail multi-select grid.
- **`data/*.json`** — flat JSON arrays; the only files Assa needs to edit to manage inventory.

### JSON schemas

**`data/couture.json`**: `{ id, name, price, description, image }`
**`data/tissus.json`**: `{ id, image, disponibilite }` — `disponibilite` values: `"disponible"`, `"limité"`, `"épuisé"`
**`data/bijoux.json`**: `{ id, name, price, base: ["or","argent"], image }`

### `commander.html` — the key feature

Two-step form: category selection (Couture or Bijoux) → category-specific fields → common fields (name, email, message, delivery). On submit, Formspree sends a structured email to Assa. The form `action` must point to the Formspree endpoint URL (configured in Formspree dashboard).

## Deployment (GitHub Pages)

1. Push to GitHub: `git push -u origin main`
2. In repo Settings → Pages → Source: **Deploy from branch** → `main` / `(root)`
3. Site live at `https://<username>.github.io/<repo-name>/`

The `.nojekyll` file at the root prevents GitHub Pages from running Jekyll processing (required since we have directories starting with `_`-like paths via imports).

No CI workflow needed — Pages deploys automatically on every push to `main`.

## Before going live — checklist for Assa

- Replace `contact@assacreation.com` in all HTML footer/header with her real email
- Create a free [Formspree](https://formspree.io) account, create a form, and replace `https://formspree.io/f/XXXXXX` in `commander.html` with the real endpoint
- Add photos to `images/` subdirectories (`couture/`, `tissus/`, `bijoux/`) — filenames must match those in the JSON files
- Optionally uncomment and fill in the Instagram link in the footer
