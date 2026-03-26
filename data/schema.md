# Data file schemas

This folder contains the three JSON files Assa edits to manage the catalogue.
Each file is an **array** of objects. Fields marked `*` are required.

---

## couture.json

| Field         | Type    | Description |
|---------------|---------|-------------|
| `id` *        | string  | Unique slug, no spaces or special characters. e.g. `"tote-bag"` |
| `name` *      | string  | Display name shown on the site. e.g. `"Tote bag"` |
| `price` *     | number  | Price in euros. Use `0` if price is on request. e.g. `15` |
| `description` *| string | Short description shown on the product card. |
| `image` *     | string  | Path to the image file. e.g. `"images/couture/tote-bag.avif"` |

---

## tissus.json

| Field             | Type   | Description |
|-------------------|--------|-------------|
| `id` *            | number | Fabric number (integer starting at 1). e.g. `1` |
| `image` *         | string | Path to the photo. e.g. `"images/tissus/tissu-01.avif"` |
| `disponibilite` * | string | Stock status — must be **exactly** one of: |
|                   |        | `"disponible"` — in stock |
|                   |        | `"limité"` — limited quantity |
|                   |        | `"épuisé"` — out of stock (tile greyed out, not selectable) |

---

## bijoux.json

| Field    | Type     | Description |
|----------|----------|-------------|
| `id` *   | string   | Unique slug. e.g. `"collier-ras-de-cou"` |
| `name` * | string   | Display name. e.g. `"Collier ras de cou"` |
| `price` *| number   | Price in euros. e.g. `15` |
| `base` * | string[] | Array of available metal bases. Allowed values: `"or"`, `"argent"`. e.g. `["or", "argent"]` |
| `image` *| string   | Path to the photo. e.g. `"images/bijoux/collier-ras-de-cou.avif"` |

---

## Validation errors

If a field is missing or has the wrong value, that entry is **skipped** and a warning
appears in the browser console (F12 → Console):

```
[Assa] couture.json — entry "my-item" skipped: "price" must be a number >= 0
```
