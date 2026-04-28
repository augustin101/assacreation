# Assa Créations — Project Guide

## What this is

A static website for Assa Créations, a small French handmade goods business selling
wax-fabric clothing/accessories (couture) and hand-beaded jewellery (bijoux). Customers
browse the catalogue and submit orders through a contact form.

Deployed on **GitHub Pages** at the domain defined in `CNAME`.
No server, no framework, no build step — plain HTML + CSS + vanilla JS ES modules.

---

## Architecture

```
assacreation/
├── *.html            # One file per page, no templating engine
├── css/              # Stylesheets loaded in order by every page
├── js/               # ES modules (type="module"), loaded per-page
├── data/             # JSON catalogue files — the only thing Assa edits
├── images/           # Static assets (AVIF preferred, see below)
│   ├── bijoux/
│   ├── couture/
│   ├── tissus/
│   ├── welcome/
│   └── about/
└── tests/            # Vitest unit tests (Node + jsdom)
```

The site has **no bundler**. Scripts use native ES module `import`/`export`. This means:
- The site cannot be opened via `file://` — a local HTTP server is required.
- Use `npm run dev` (browser-sync, live-reload) instead of Python's http.server.

---

## Pages

| File | Route | Purpose |
|---|---|---|
| `index.html` | `/` | Homepage — hero, feature highlights, CTAs |
| `bijoux.html` | `/bijoux.html` | Jewellery catalogue grid |
| `couture.html` | `/couture.html` | Clothing catalogue + fabric swatch gallery |
| `commander.html` | `/commander.html` | Order form |
| `a-propos.html` | `/a-propos.html` | About page — static, no JS catalogue |

Every page loads `js/components.js` (header + footer injection) as its first script.
Catalogue pages additionally load `js/catalogue.js`.
The order page loads `js/order-form.js`.

---

## JavaScript files

### `js/components.js`
Injects the shared `<header>` and `<footer>` into every page, marks the active nav link,
and sets the copyright year. No external dependencies.

### `js/validate.js`
Runtime schema validation for the three JSON data files. Each `validateX(data)` function
accepts raw parsed JSON, emits `console.warn` for every invalid entry (visible in DevTools),
and returns only the valid items so the rest of the app continues safely.

**Schema rules enforced:**
- `couture.json` — id (string), name (string), price (number ≥ 0), description (string), image (string)
- `tissus.json` — id (integer ≥ 1), image (string), disponibilite ∈ {`"disponible"`, `"limité"`, `"épuisé"`}
- `bijoux.json` — id (string), name (string), price (number ≥ 0), base (non-empty array of non-empty strings), image (string)

`base` accepts any non-empty strings — not just `"or"` and `"argent"`. This allows colour
names (e.g. `"bleu"`, `"jaune"`) for jewellery pieces that don't use a metal base.

### `js/catalogue.js`
Fetches and renders the product grids and fabric gallery on `bijoux.html` and `couture.html`.

Key functions:
- `createBijouxCard({ name, price, base, image })` — renders a jewellery card. The `base`
  values are capitalised and shown as a translucent overlay badge on the image.
- `createProductCard({ name, price, description, image })` — renders a couture card.
- `createTissuTile({ id, image, disponibilite })` — renders a fabric swatch tile.
  Épuisé tiles are greyed out and non-clickable.
- `openLightbox(src, alt)` / `closeLightbox()` — full-screen image overlay, built lazily
  on first use.

### `js/order-form.js`
Drives the entire order form on `commander.html`. The form is split into two mutually
exclusive sections (couture / bijoux) controlled by a category radio.

Key behaviours:
- **Couture flow**: article checkboxes with quantity +/− controls; a fabric-picker modal
  (with availability filtering) for each checked article × quantity slot.
- **Bijoux flow**: dynamic list of bijou rows; each row opens a bijou-picker modal; if the
  selected bijou has multiple base options, radio buttons are generated dynamically from
  the `base` array (so colour bases like `"bleu"` appear correctly alongside `"or"` and
  `"argent"`).
- **Shared limit**: max 5 items total across both sections.
- **Submission**: POSTs to Formspree (`https://formspree.io/f/xojpveor`). Before sending,
  strips internal radio fields (`_categorie`, `_metal_N`) and inactive-section fields from
  the FormData. Shows an inline confirmation card on success.
- **Validation**: checks bijou and metal/base selection completeness before submitting,
  and uses `validateContactFields()` for prenom/nom/email.

---

## CSS files

All pages include the stylesheets in this exact order:

| File | Role |
|---|---|
| `css/reset.css` | Minimal reset (box-sizing, margin-zero, link colours) |
| `css/tokens.css` | **All** design tokens as CSS custom properties — colours, type scale, spacing scale, radii, shadows, transitions. Edit here first before touching any other CSS. |
| `css/main.css` | Base typography, body, `.container`, `.page-hero`, `.section-header` |
| `css/layout.css` | Sticky header, nav (desktop + hamburger mobile), footer |
| `css/components.css` | Buttons, badges, product cards, fabric gallery tiles, lightbox, `.product-base-badge` |
| `css/pages.css` | Page-specific overrides (index hero, about layout, etc.) |
| `css/form.css` | Order form — radio cards, article rows, fabric/bijou modals, price summary |

`form.css` is only loaded by `commander.html`.

**Design palette** (from `tokens.css`):
- Background: `#FAF8F5` (off-white)
- Surface: `#F0E9DC` (warm sand)
- Accent: `#B5623D` (terracotta)
- Text: `#2A1A0E` (dark brown)
- Fonts: Playfair Display (headings) + DM Sans (body), loaded from Google Fonts in each HTML `<head>`

---

## Data files (`data/`)

These are the **only files Assa should need to edit** to manage the catalogue.
See `data/schema.md` for the full field reference.

### `data/couture.json`
Array of clothing/accessory products. Fields: `id`, `name`, `price`, `description`, `image`.

### `data/bijoux.json`
Array of jewellery pieces. Fields: `id`, `name`, `price`, `base`, `image`.

**Naming conventions enforced:**
- Names always start with "Boucles d'oreilles" (plural, capital B) — never the singular form.
- French adjectives are lowercase: "ghanéennes", "cauri", "torsadées" — not "Ghanéennes".
- When multiple variations of the same piece exist, append `— Type I`, `— Type II`, etc.
  (starting at 1) and keep them adjacent in the array.
- IDs follow the same convention: `boucles-oreilles-ghaneennes-1`, `boucles-oreilles-ghaneennes-2`.

**Base field:** array of available personalisation options. Standard values are `"or"` and
`"argent"`. Colour names (`"bleu"`, `"jaune"`, etc.) are also valid for non-metal pieces.
The order form dynamically generates radio buttons from whatever values are in this array.

### `data/tissus.json`
Array of fabric swatches. Fields: `id` (integer, sequential from 1), `image`, `disponibilite`.
`disponibilite` must be exactly one of `"disponible"`, `"limité"`, `"épuisé"`.

---

## Images

**Format:** AVIF strongly preferred. AVIF files in this project are typically 8–28 KB.
Raw JPG photos from a phone are 2–3 MB — always convert before committing.

**Converting a JPG to AVIF with ffmpeg:**
```bash
ffmpeg -y -i input.jpg -c:v libaom-av1 -crf 33 -b:v 0 -still-picture 1 -vf "scale=1200:-1" output.avif
```
- `crf 33` — good quality/size balance (scale 0=lossless → 63=worst; 50+ is too aggressive)
- `scale=1200:-1` — cap width at 1200 px (lightbox max is 600 px; 1200 px gives 2× for HiDPI)
- Result: ~100 KB — roughly 30× smaller than the source JPG

**Image directories:**
- `images/bijoux/` — jewellery photos
- `images/couture/` — clothing photos
- `images/tissus/` — fabric swatches (`tissu-01.avif` … `tissu-NN.avif`)
- `images/welcome/` — homepage hero and logo
- `images/about/` — à-propos page

Note: `images/bofimo_paquerettes` is an AVIF file that was renamed without its extension —
it still works but the browser relies on content sniffing rather than the MIME type header.
Rename it to `bofimo_paquerettes.avif` and update the reference in `bijoux.json` when convenient.

---

## Development workflow

```bash
npm run dev    # Start browser-sync dev server on :8000 with live-reload
npm test       # Run the full Vitest test suite (Node + jsdom)
```

`npm run dev` watches `**/*.html`, `**/*.css`, `**/*.js`, and `data/*.json` and
automatically reloads the browser on any save. Do not use `python3 -m http.server` —
it does not set Cache-Control headers, so JS and JSON are cached aggressively and
changes appear only after a hard refresh.

---

## Tests (`tests/`)

Three test files, run with Vitest.

| File | Environment | What it tests |
|---|---|---|
| `tests/validate.test.js` | Node | Unit tests for all three `validateX()` functions — valid entries, every invalid field combination, edge cases |
| `tests/data.test.js` | Node | Integrity of the live JSON files: all entries pass validation, no duplicate IDs, all referenced image files exist on disk, tissus IDs form a continuous sequence |
| `tests/order-form.test.js` | jsdom | Full integration tests for the order form DOM — category switching, couture flow (articles, quantities, fabric picker), bijoux flow (modal, base selection, removal), price summary, validation, form submission, FormData stripping |

`tests/data.test.js` catches broken image references and bad `disponibilite` values
immediately — run `npm test` after editing any `data/*.json` file.

---

## Deployment

Pushing to `main` on GitHub triggers automatic deployment to GitHub Pages.
There is no CI pipeline — tests must be run locally before pushing.

The `CNAME` file sets the custom domain. `.nojekyll` prevents GitHub Pages from
processing the site through Jekyll (required since filenames contain underscores).

---

## Common tasks

**Add a new bijou:**
1. Convert the photo to AVIF and place it in `images/bijoux/`.
2. Add an entry to `data/bijoux.json` following the naming conventions above.
3. Run `npm test` — `data.test.js` will catch any missing image or schema error.

**Add a new couture product:**
Same as above but edit `data/couture.json` and put the image in `images/couture/`.

**Mark a fabric as out of stock:**
In `data/tissus.json`, change `"disponibilite"` to `"épuisé"`. The tile turns grey and
becomes non-clickable automatically.

**Add a new fabric swatch:**
Add the image as `images/tissus/tissu-NN.avif` where NN is the next sequential number,
and add the entry to `data/tissus.json`. IDs must be consecutive — the test suite
explicitly checks for gaps.

**Change a price:**
Edit the `price` field in the relevant JSON file. The order form picks it up automatically
and recalculates the estimated total.
