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
  const raw   = loadJSON('data/couture.json');
  const valid = validateCouture(raw);

  test('all entries pass validation', () => {
    assert.equal(
      valid.length,
      raw.length,
      `${raw.length - valid.length} invalid entry/entries — see warnings above`,
    );
  });

  test('no duplicate ids', () => {
    const ids        = raw.map(item => item.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(duplicates, [], `duplicate ids: ${duplicates.join(', ')}`);
  });

  test('all images exist on disk', () => {
    const missing = valid
      .map(item => item.image)
      .filter(img => !existsSync(imagePath(img)));
    assert.deepEqual(missing, [], `missing images:\n  ${missing.join('\n  ')}`);
  });
});

// ── tissus.json ───────────────────────────────────────────────

describe('tissus.json', () => {
  const raw   = loadJSON('data/tissus.json');
  const valid = validateTissus(raw);

  test('all entries pass validation', () => {
    assert.equal(
      valid.length,
      raw.length,
      `${raw.length - valid.length} invalid entry/entries — see warnings above`,
    );
  });

  test('no duplicate ids', () => {
    const ids        = raw.map(item => item.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(duplicates, [], `duplicate ids: ${duplicates.join(', ')}`);
  });

  test('ids form a continuous sequence with no gaps', () => {
    const ids      = valid.map(t => t.id).sort((a, b) => a - b);
    const expected = Array.from({ length: ids.length }, (_, i) => i + 1);
    assert.deepEqual(ids, expected, `expected sequence: ${expected.join(', ')}`);
  });

  test('all images exist on disk', () => {
    const missing = valid
      .map(t => t.image)
      .filter(img => !existsSync(imagePath(img)));
    assert.deepEqual(missing, [], `missing images:\n  ${missing.join('\n  ')}`);
  });
});

// ── bijoux.json ───────────────────────────────────────────────

describe('bijoux.json', () => {
  const raw   = loadJSON('data/bijoux.json');
  const valid = validateBijoux(raw);

  test('all entries pass validation', () => {
    assert.equal(
      valid.length,
      raw.length,
      `${raw.length - valid.length} invalid entry/entries — see warnings above`,
    );
  });

  test('no duplicate ids', () => {
    const ids        = raw.map(item => item.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    assert.deepEqual(duplicates, [], `duplicate ids: ${duplicates.join(', ')}`);
  });

  test('all images exist on disk', () => {
    const missing = valid
      .map(item => item.image)
      .filter(img => !existsSync(imagePath(img)));
    assert.deepEqual(missing, [], `missing images:\n  ${missing.join('\n  ')}`);
  });
});
