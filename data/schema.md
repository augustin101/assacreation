# Schéma des fichiers de données

Ce dossier contient les trois fichiers JSON qu'Assa édite pour gérer le catalogue.
Chaque fichier est un **tableau** d'objets. Les champs marqués `*` sont obligatoires.

---

## couture.json

| Champ         | Type     | Description |
|---------------|----------|-------------|
| `id` *        | string   | Identifiant unique, sans espaces ni accents. Ex. `"tote-bag"` |
| `name` *      | string   | Nom affiché sur le site. Ex. `"Tote bag"` |
| `price` *     | number   | Prix en euros. Mettre `0` si le prix est sur devis. Ex. `15` |
| `description` *| string  | Courte description affichée sur la fiche produit. |
| `image` *     | string   | Chemin vers l'image. Ex. `"images/couture/tote-bag.avif"` |

---

## tissus.json

| Champ            | Type   | Description |
|------------------|--------|-------------|
| `id` *           | number | Numéro du tissu (entier, commence à 1). Ex. `1` |
| `image` *        | string | Chemin vers la photo. Ex. `"images/tissus/tissu-01.avif"` |
| `disponibilite` *| string | État du stock — **une seule** des valeurs suivantes : |
|                  |        | `"disponible"` — en stock |
|                  |        | `"limité"` — quantité limitée |
|                  |        | `"épuisé"` — plus disponible (tissu grisé, non sélectionnable) |

---

## bijoux.json

| Champ    | Type     | Description |
|----------|----------|-------------|
| `id` *   | string   | Identifiant unique. Ex. `"collier-ras-de-cou"` |
| `name` * | string   | Nom affiché. Ex. `"Collier ras de cou"` |
| `price` *| number   | Prix en euros. Ex. `15` |
| `base` * | string[] | Tableau des bases métal disponibles. Valeurs autorisées : `"or"`, `"argent"`. Ex. `["or", "argent"]` |
| `image` *| string   | Chemin vers la photo. Ex. `"images/bijoux/collier-ras-de-cou.avif"` |

---

## Erreurs de validation

Si un champ est manquant ou incorrect, l'entrée concernée est **ignorée** et un avertissement
apparaît dans la console du navigateur (F12 → Console), sous la forme :

```
[Assa] couture.json — entrée "mon-article" ignorée : "price" doit être un nombre ≥ 0
```
