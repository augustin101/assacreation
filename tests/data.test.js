// tests/data.test.js — Integrity tests for data/*.json
//
// Checks:
//   1. Every entry passes schema validation (no entries silently dropped)
//   2. Every referenced image file exists on disk
//   3. No duplicate ids within each file

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateCouture, validateTissus, validateBijoux } from '../js/validate.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function loadJSON(relPath) {
  return JSON.parse(readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function imagePath(rel) {
  return path.join(ROOT, rel);
}

// ── couture.json ──────────────────────────────────────────────

describe('couture.json', () => {
  const raw = loadJSON('data/couture.json');
  const valid = validateCouture(raw);

  test('toutes les entrées passent la validation', () => {
    assert.equal(
      valid.length,
      raw.length,
      `${raw.length - valid.length} entrée(s) invalide(s) — voir les avertissements ci-dessus`,
    );
  });

  test('pas d\'id dupliqué', () => {
    const ids = raw.map(item => item.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(duplicates, [], `ids dupliqués : ${duplicates.join(', ')}`);
  });

  test('toutes les images existent sur le disque', () => {
    const missing = valid
      .map(item => item.image)
      .filter(img => !existsSync(imagePath(img)));
    assert.deepEqual(missing, [], `images manquantes :\n  ${missing.join('\n  ')}`);
  });
});

// ── tissus.json ───────────────────────────────────────────────

describe('tissus.json', () => {
  const raw = loadJSON('data/tissus.json');
  const valid = validateTissus(raw);

  test('toutes les entrées passent la validation', () => {
    assert.equal(
      valid.length,
      raw.length,
      `${raw.length - valid.length} entrée(s) invalide(s) — voir les avertissements ci-dessus`,
    );
  });

  test('pas d\'id dupliqué', () => {
    const ids = raw.map(item => item.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(duplicates, [], `ids dupliqués : ${duplicates.join(', ')}`);
  });

  test('les ids forment une suite continue sans trous', () => {
    const ids = valid.map(t => t.id).sort((a, b) => a - b);
    const expected = Array.from({ length: ids.length }, (_, i) => i + 1);
    assert.deepEqual(ids, expected, `Suite attendue : ${expected.join(', ')}`);
  });

  test('toutes les images existent sur le disque', () => {
    const missing = valid
      .map(t => t.image)
      .filter(img => !existsSync(imagePath(img)));
    assert.deepEqual(missing, [], `images manquantes :\n  ${missing.join('\n  ')}`);
  });
});

// ── bijoux.json ───────────────────────────────────────────────

describe('bijoux.json', () => {
  const raw = loadJSON('data/bijoux.json');
  const valid = validateBijoux(raw);

  test('toutes les entrées passent la validation', () => {
    assert.equal(
      valid.length,
      raw.length,
      `${raw.length - valid.length} entrée(s) invalide(s) — voir les avertissements ci-dessus`,
    );
  });

  test('pas d\'id dupliqué', () => {
    const ids = raw.map(item => item.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(duplicates, [], `ids dupliqués : ${duplicates.join(', ')}`);
  });

  test('toutes les images existent sur le disque', () => {
    const missing = valid
      .map(item => item.image)
      .filter(img => !existsSync(imagePath(img)));
    assert.deepEqual(missing, [], `images manquantes :\n  ${missing.join('\n  ')}`);
  });
});
