/**
 * validate.js — Runtime schema validation for data/*.json
 *
 * Each function accepts parsed JSON, logs a console.warn for every
 * invalid entry (with the entry id and the reason), and returns only
 * the valid items so the rest of the app can continue safely.
 *
 * ═══════════════════════════════════════════════════════════════
 * SCHEMAS — reference for editing the data/*.json files
 * ═══════════════════════════════════════════════════════════════
 *
 * data/couture.json — array of objects:
 *   id          string   Unique slug, e.g. "bob"
 *   name        string   Display name, e.g. "Bob"
 *   price       number   Price in €, >= 0 (use 0 for quote-on-request)
 *   description string   Short description shown on the product card
 *   image       string   Relative path, e.g. "images/couture/bob.avif"
 *
 * data/tissus.json — array of objects:
 *   id            number   Fabric number (integer >= 1), e.g. 1
 *   image         string   Relative path, e.g. "images/tissus/tissu-01.avif"
 *   disponibilite string   One of: "disponible" | "limité" | "épuisé"
 *
 * data/bijoux.json — array of objects:
 *   id    string   Unique slug, e.g. "collier-ras-de-cou"
 *   name  string   Display name
 *   price number   Price in €, >= 0
 *   base  array    Non-empty array of non-empty strings, e.g. ["or", "argent"] or ["argent", "bleu", "jaune"]
 *   image string   Relative path, e.g. "images/bijoux/collier-ras-de-cou.avif"
 */

const DISPONIBILITE_VALUES = ['disponible', 'limité', 'épuisé'];

function warn(file, id, msg) {
  console.warn(`[Assa] ${file} — entry "${id}" skipped: ${msg}`);
}

export function validateCouture(data) {
  if (!Array.isArray(data)) {
    console.warn('[Assa] couture.json — file must be a JSON array');
    return [];
  }
  return data.filter(item => {
    const { id, name, price, description, image } = item ?? {};
    if (typeof id          !== 'string' || !id)          { warn('couture.json', id ?? '?', '"id" must be a non-empty string');           return false; }
    if (typeof name        !== 'string' || !name)        { warn('couture.json', id,        '"name" must be a non-empty string');          return false; }
    if (typeof price       !== 'number' || price < 0)    { warn('couture.json', id,        '"price" must be a number >= 0');              return false; }
    if (typeof description !== 'string' || !description) { warn('couture.json', id,        '"description" must be a non-empty string');   return false; }
    if (typeof image       !== 'string' || !image)       { warn('couture.json', id,        '"image" must be a non-empty string');         return false; }
    return true;
  });
}

export function validateTissus(data) {
  if (!Array.isArray(data)) {
    console.warn('[Assa] tissus.json — file must be a JSON array');
    return [];
  }
  return data.filter(item => {
    const { id, image, disponibilite } = item ?? {};
    if (typeof id !== 'number' || !Number.isInteger(id) || id < 1) {
      warn('tissus.json', id ?? '?', '"id" must be an integer >= 1');
      return false;
    }
    if (typeof image !== 'string' || !image) {
      warn('tissus.json', id, '"image" must be a non-empty string');
      return false;
    }
    if (!DISPONIBILITE_VALUES.includes(disponibilite)) {
      warn('tissus.json', id, `"disponibilite" must be one of: ${DISPONIBILITE_VALUES.join(', ')}`);
      return false;
    }
    return true;
  });
}

export function validateBijoux(data) {
  if (!Array.isArray(data)) {
    console.warn('[Assa] bijoux.json — file must be a JSON array');
    return [];
  }
  return data.filter(item => {
    const { id, name, price, base, image } = item ?? {};
    if (typeof id    !== 'string' || !id)         { warn('bijoux.json', id ?? '?', '"id" must be a non-empty string');               return false; }
    if (typeof name  !== 'string' || !name)       { warn('bijoux.json', id,        '"name" must be a non-empty string');             return false; }
    if (typeof price !== 'number' || price < 0)   { warn('bijoux.json', id,        '"price" must be a number >= 0');                 return false; }
    if (!Array.isArray(base) || base.length === 0)              { warn('bijoux.json', id, '"base" must be a non-empty array');                    return false; }
    if (!base.every(b => typeof b === 'string' && b.length > 0)){ warn('bijoux.json', id, '"base" entries must be non-empty strings');            return false; }
    if (typeof image !== 'string' || !image)      { warn('bijoux.json', id,        '"image" must be a non-empty string');            return false; }
    return true;
  });
}
