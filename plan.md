# assacreation.com — Build Plan
> Static site for Assa Créations · Hosted on GitHub Pages · Domain: assacreation.com (as a second step, first use default github action page)

---

## 1. Overview

A clean, artisanal-feeling static website that replaces the Wix site. It showcases handmade clothing and jewellery, lets customers browse fabrics and customisation options, and guides them through placing a custom order via a structured contact form — all without any backend or e-commerce complexity.

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Markup | **HTML5** | No build step, universally readable |
| Styling | **CSS3 + CSS custom properties** | Zero dependencies, easy to theme |
| Interactivity | **Vanilla JS (ES modules)** | No framework overhead for a catalogue site |
| Data | **JSON flat files** | Products, fabrics, jewellery stored as plain data; easy for Assa to edit |
| Contact form | **Formspree (free tier)** | Emails Assa on submission; no server needed; works on static hosts |
| Hosting | **GitHub Pages** | Free, reliable, custom

 domain support |
| Custom domain | **assacreation.com** | Point DNS CNAME → `<username>.github.io` |

No Node, no npm, no build pipeline. Open the folder — it works.

---

## 3. Site Structure

```
assacreation.com/
├── index.html          ← Home
├── couture.html        ← Sewing creations + fabric gallery
├── bijoux.html         ← Jewellery catalogue
├── commander.html      ← Custom order form (the main UX upgrade)
├── a-propos.html       ← About Assa
│
├── css/
│   ├── reset.css
│   ├── tokens.css      ← colours, fonts, spacing (CSS vars)
│   └── main.css
│
├── js/
│   ├── catalogue.js    ← Renders product/fabric grids from JSON
│   └── order-form.js   ← Dynamic dropdowns logic
│
├── data/
│   ├── couture.json    ← Sewing items (name, price, description, image)
│   ├── tissus.json     ← Fabrics (number, image, availability flag)
│   └── bijoux.json     ← Jewellery items
│
└── images/
    ├── couture/
    ├── tissus/
    └── bijoux/
```

---

## 4. Design Direction

- **Palette**: warm terracotta / sand / off-white (matching the existing brand logo colours)
- **Typography**: a readable serif for headings (e.g. `Playfair Display` via Google Fonts) + clean sans-serif for body
- **Feel**: artisanal, minimal, airy — no flashy animations; focus on product photography
- **Language**: French (matching the current site)
- **Mobile-first**: all layouts use CSS Grid / Flexbox, no fixed widths

---

## 5. Page-by-Page Specification

### 5.1 `index.html` — Accueil
- Hero with logo + one strong product photo
- 2-sentence brand pitch
- Two CTA cards: **Couture** and **Bijoux**
- Short "Comment ça marche" explainer (collapsible on mobile)
- Footer: email link, Instagram if applicable

### 5.2 `couture.html` — Couture
Two sections on this page:

**Les créations** — product grid rendered from `couture.json`
Each card shows: photo, name, indicative price, short description.

**Les tissus** — fabric gallery rendered from `tissus.json`
Each tile shows: numbered fabric image, availability badge (disponible / quantité limitée).
Clicking a fabric opens a lightbox with a larger view.

### 5.3 `bijoux.html` — Bijoux
Product grid rendered from `bijoux.json`.
Each card shows: photo, name, price, customisation note (base métal: or / argent).

### 5.4 `commander.html` — Passer commande ⭐ (the key upgrade)

A guided two-step order form that compiles a clear, structured email to Assa.

**Step 1 — Choisir une catégorie** (radio / tab toggle)
- Couture
- Bijoux

**If Couture selected:**
- Dropdown: *Article* (Bob, Tote bag, Chouchou, Caleçon, Cotons réutilisables, Tablier, Étui à couverts, Sac à dos, Pon'chaud, autre…)
- Multi-select visual grid: *Tissu(s) souhaité(s)* — thumbnails of all fabrics numbered 1–15+, checkboxes on hover
- Optional: *Tissu de doublure* (same grid, optional)
- Textarea: *Précisions / mesures / idées*

**If Bijoux selected:**
- Dropdown: *Type de bijou* (Boucles d'oreilles, Collier ras-de-cou, Bracelet de hanche, Bracelet, autre…)
- Dropdown: *Modèle* (list from bijoux.json, or "Idée libre / thème")
- Color picker chips: *Thème de couleur des perles* (multi-select color swatches)
- Radio: *Base métal* → Or / Argent
- Textarea: *Inspiration / description*

**Common fields (both categories):**
- Prénom / Nom
- Email
- Textarea: *Message complémentaire*
- Checkbox: *Livraison souhaitée* (oui / non — je viendrai retirer ma commande)

**Submit button** → Formspree sends a nicely formatted email to Assa with all selections laid out.

A confirmation message replaces the form on success.

### 5.5 `a-propos.html` — À propos
Short bio, photo of Assa at work, note about open commissions for custom ideas.

---

## 6. Data Files (JSON examples)

### `data/couture.json`
```json
[
  {
    "id": "bob",
    "name": "Bob",
    "price": 15,
    "description": "Bob en tissu africain, doublure intérieure.",
    "image": "images/couture/bob.jpg"
  },
  {
    "id": "tote-bag",
    "name": "Tote bag",
    "price": 10,
    "description": "Grand tote bag résistant, anses solides.",
    "image": "images/couture/tote-bag.jpg"
  }
]
```

### `data/tissus.json`
```json
[
  { "id": 1, "image": "images/tissus/tissu-01.jpg", "disponibilite": "disponible" },
  { "id": 2, "image": "images/tissus/tissu-02.jpg", "disponibilite": "disponible" },
  { "id": 10, "image": "images/tissus/tissu-10.jpg", "disponibilite": "limité" }
]
```

### `data/bijoux.json`
```json
[
  {
    "id": "boucles-perles-tissees",
    "name": "Boucles d'oreille en perles tissées",
    "price": 15,
    "base": ["or", "argent"],
    "image": "images/bijoux/boucles-perles-tissees.jpg"
  }
]
```

---

## 7. GitHub Pages Setup

1. Create repo: `assacreation` (or `<username>.github.io`)
2. Push all static files to `main` branch
3. Enable GitHub Pages → source: `main` branch, root `/`
4. In repo Settings → Pages → Custom domain: `assacreation.com`
5. At the domain registrar, add a CNAME record pointing `www` → `<username>.github.io` and A records for the apex domain pointing to GitHub's IPs
6. Check "Enforce HTTPS" once the cert is provisioned (~10 min)

---

## 8. Formspree Setup (contact form)

1. Create a free account at formspree.io
2. Create a new form → get the endpoint URL (e.g. `https://formspree.io/f/xyzabc`)
3. Set the form `action` attribute to that URL and `method="POST"`
4. Configure notification email to Assa's address in the Formspree dashboard
5. Optionally set a custom subject line and redirect URL in Formspree settings

Free tier: 50 submissions/month (more than enough for a handcraft shop).

---

## 9. Implementation Steps for Claude Code

```
Phase 1 — Scaffolding
  1. Create folder structure and all empty files
  2. Write CSS tokens (colour palette, typography scale, spacing)
  3. Write reset.css and main.css base styles
  4. Write shared header/footer HTML snippets (copy-paste or JS include)

Phase 2 — Data
  5. Populate couture.json, tissus.json, bijoux.json with all products
     (images referenced by path; actual image files added separately by Assa)

Phase 3 — Pages
  6. index.html — hero, CTAs, how-it-works
  7. couture.html — products + fabric gallery (JS renders from JSON)
  8. bijoux.html — jewellery grid (JS renders from JSON)
  9. a-propos.html — static content

Phase 4 — Order Form (commander.html)
  10. HTML structure with both couture/bijoux sections
  11. JS: toggle sections on category change
  12. JS: populate article dropdown from couture.json
  13. JS: render fabric thumbnail grid with checkboxes
  14. JS: populate jewellery dropdown from bijoux.json
  15. Connect to Formspree endpoint

Phase 5 — Polish
  16. Lightbox for fabric images
  17. Responsive QA (mobile, tablet, desktop)
  18. Accessibility pass (labels, focus styles, alt text)
  19. Performance: lazy-load images

Phase 6 — Deploy
  20. Git init, push to GitHub
  21. Enable GitHub Pages + custom domain
  22. DNS configuration
  23. Final smoke test on live URL
```

---

## 10. Maintenance Notes for Assa

After launch, keeping the site up to date requires only:
- **Adding a product**: add an entry to the relevant JSON file + drop the image in the right folder
- **Removing a fabric**: set `"disponibilite": "épuisé"` in `tissus.json` (it will show as unavailable in the form)
- **Price change**: edit the `price` field in JSON

No CMS, no login, no monthly fee beyond the domain (~10–15€/year).