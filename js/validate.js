/**
 * validate.js — Runtime schema validation for data/*.json
 *
 * Each function accepts parsed JSON, logs a console.warn for every
 * invalid entry (with the entry id and the reason), and returns only
 * the valid items so the rest of the app can continue safely.
 *
 * ═══════════════════════════════════════════════════════════════
 * SCHÉMAS — référence pour l'édition des fichiers data/*.json
 * ═══════════════════════════════════════════════════════════════
 *
 * data/couture.json — tableau d'objets :
 *   id          string   Identifiant unique (slug), ex. "bob"
 *   name        string   Nom affiché, ex. "Bob"
 *   price       number   Prix en €, ≥ 0 (mettre 0 si prix sur devis)
 *   description string   Courte description sur la fiche produit
 *   image       string   Chemin relatif, ex. "images/couture/bob.avif"
 *
 * data/tissus.json — tableau d'objets :
 *   id            number   Numéro du tissu (entier ≥ 1), ex. 1
 *   image         string   Chemin relatif, ex. "images/tissus/tissu-01.avif"
 *   disponibilite string   L'une des valeurs : "disponible" | "limité" | "épuisé"
 *
 * data/bijoux.json — tableau d'objets :
 *   id    string   Identifiant unique (slug), ex. "collier-ras-de-cou"
 *   name  string   Nom affiché
 *   price number   Prix en €, ≥ 0
 *   base  array    Tableau non vide, valeurs autorisées : "or" | "argent"
 *   image string   Chemin relatif, ex. "images/bijoux/collier-ras-de-cou.avif"
 */

const DISPONIBILITE_VALUES = ['disponible', 'limité', 'épuisé'];
const BASE_VALUES          = ['or', 'argent'];

function warn(file, id, msg) {
  console.warn(`[Assa] ${file} — entrée "${id}" ignorée : ${msg}`);
}

export function validateCouture(data) {
  if (!Array.isArray(data)) {
    console.warn('[Assa] couture.json — le fichier doit être un tableau JSON');
    return [];
  }
  return data.filter(item => {
    const { id, name, price, description, image } = item ?? {};
    if (typeof id          !== 'string' || !id)          { warn('couture.json', id ?? '?', '"id" doit être une chaîne non vide');           return false; }
    if (typeof name        !== 'string' || !name)        { warn('couture.json', id,        '"name" doit être une chaîne non vide');          return false; }
    if (typeof price       !== 'number' || price < 0)    { warn('couture.json', id,        '"price" doit être un nombre ≥ 0');               return false; }
    if (typeof description !== 'string' || !description) { warn('couture.json', id,        '"description" doit être une chaîne non vide');   return false; }
    if (typeof image       !== 'string' || !image)       { warn('couture.json', id,        '"image" doit être une chaîne non vide');         return false; }
    return true;
  });
}

export function validateTissus(data) {
  if (!Array.isArray(data)) {
    console.warn('[Assa] tissus.json — le fichier doit être un tableau JSON');
    return [];
  }
  return data.filter(item => {
    const { id, image, disponibilite } = item ?? {};
    if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
      warn('tissus.json', id ?? '?', '"id" doit être un entier ≥ 1');
      return false;
    }
    if (typeof image !== 'string' || !image) {
      warn('tissus.json', id, '"image" doit être une chaîne non vide');
      return false;
    }
    if (!DISPONIBILITE_VALUES.includes(disponibilite)) {
      warn('tissus.json', id, `"disponibilite" doit être l'une de : ${DISPONIBILITE_VALUES.join(', ')}`);
      return false;
    }
    return true;
  });
}

export function validateBijoux(data) {
  if (!Array.isArray(data)) {
    console.warn('[Assa] bijoux.json — le fichier doit être un tableau JSON');
    return [];
  }
  return data.filter(item => {
    const { id, name, price, base, image } = item ?? {};
    if (typeof id    !== 'string' || !id)         { warn('bijoux.json', id ?? '?', '"id" doit être une chaîne non vide');               return false; }
    if (typeof name  !== 'string' || !name)       { warn('bijoux.json', id,        '"name" doit être une chaîne non vide');             return false; }
    if (typeof price !== 'number' || price < 0)   { warn('bijoux.json', id,        '"price" doit être un nombre ≥ 0');                  return false; }
    if (!Array.isArray(base) || base.length === 0){ warn('bijoux.json', id,        '"base" doit être un tableau non vide');             return false; }
    if (!base.every(b => BASE_VALUES.includes(b))){ warn('bijoux.json', id,        `"base" valeurs autorisées : ${BASE_VALUES.join(', ')}`); return false; }
    if (typeof image !== 'string' || !image)      { warn('bijoux.json', id,        '"image" doit être une chaîne non vide');            return false; }
    return true;
  });
}
