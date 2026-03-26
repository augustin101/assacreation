// tests/validate.test.js — Unit tests for js/validate.js
// Run with: node --test tests/validate.test.js tests/data.test.js

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateCouture, validateTissus, validateBijoux } from '../js/validate.js';

// ── validateCouture ───────────────────────────────────────────

describe('validateCouture', () => {
  const VALID = {
    id: 'bob',
    name: 'Bob',
    price: 15,
    description: 'Bob en tissu africain wax.',
    image: 'images/couture/bob.avif',
  };

  test('accepts a valid array', () => {
    const result = validateCouture([VALID]);
    assert.equal(result.length, 1);
    assert.deepEqual(result[0], VALID);
  });

  test('returns [] when input is not an array', () => {
    assert.deepEqual(validateCouture(null),      []);
    assert.deepEqual(validateCouture(undefined), []);
    assert.deepEqual(validateCouture({}),        []);
    assert.deepEqual(validateCouture('text'),    []);
  });

  test('filters entries with an invalid id', () => {
    assert.equal(validateCouture([{ ...VALID, id: ''   }]).length, 0, 'empty id');
    assert.equal(validateCouture([{ ...VALID, id: 42   }]).length, 0, 'numeric id');
    assert.equal(validateCouture([{ ...VALID, id: null }]).length, 0, 'null id');
  });

  test('filters entries with an invalid name', () => {
    assert.equal(validateCouture([{ ...VALID, name: ''   }]).length, 0, 'empty name');
    assert.equal(validateCouture([{ ...VALID, name: null }]).length, 0, 'null name');
  });

  test('filters entries with an invalid price', () => {
    assert.equal(validateCouture([{ ...VALID, price: -1   }]).length, 0, 'negative price');
    assert.equal(validateCouture([{ ...VALID, price: '15' }]).length, 0, 'string price');
    assert.equal(validateCouture([{ ...VALID, price: null }]).length, 0, 'null price');
  });

  test('accepts price = 0 (quote on request)', () => {
    assert.equal(validateCouture([{ ...VALID, price: 0 }]).length, 1);
  });

  test('filters entries with an invalid description', () => {
    assert.equal(validateCouture([{ ...VALID, description: ''   }]).length, 0, 'empty description');
    assert.equal(validateCouture([{ ...VALID, description: null }]).length, 0, 'null description');
  });

  test('filters entries with an invalid image', () => {
    assert.equal(validateCouture([{ ...VALID, image: ''   }]).length, 0, 'empty image');
    assert.equal(validateCouture([{ ...VALID, image: null }]).length, 0, 'null image');
  });

  test('keeps only valid entries from a mixed array', () => {
    const result = validateCouture([
      VALID,
      { ...VALID, id: 'tote-bag', name: 'Tote bag' },
      { ...VALID, id: '',    name: 'Invalid — empty id' },
      { ...VALID, id: 'bad', price: -5 },
    ]);
    assert.equal(result.length, 2);
    assert.equal(result[0].id, 'bob');
    assert.equal(result[1].id, 'tote-bag');
  });

  test('returns [] for an empty array', () => {
    assert.deepEqual(validateCouture([]), []);
  });
});

// ── validateTissus ────────────────────────────────────────────

describe('validateTissus', () => {
  const VALID = {
    id: 1,
    image: 'images/tissus/tissu-01.avif',
    disponibilite: 'disponible',
  };

  test('accepts a valid array', () => {
    const result = validateTissus([VALID]);
    assert.equal(result.length, 1);
    assert.deepEqual(result[0], VALID);
  });

  test('returns [] when input is not an array', () => {
    assert.deepEqual(validateTissus(null),   []);
    assert.deepEqual(validateTissus({}),     []);
    assert.deepEqual(validateTissus('text'), []);
  });

  test('filters entries with an invalid id', () => {
    assert.equal(validateTissus([{ ...VALID, id: 0    }]).length, 0, 'zero id');
    assert.equal(validateTissus([{ ...VALID, id: -1   }]).length, 0, 'negative id');
    assert.equal(validateTissus([{ ...VALID, id: '1'  }]).length, 0, 'string id');
    assert.equal(validateTissus([{ ...VALID, id: 1.5  }]).length, 0, 'decimal id');
    assert.equal(validateTissus([{ ...VALID, id: null }]).length, 0, 'null id');
  });

  test('filters entries with an invalid image', () => {
    assert.equal(validateTissus([{ ...VALID, image: ''   }]).length, 0, 'empty image');
    assert.equal(validateTissus([{ ...VALID, image: null }]).length, 0, 'null image');
  });

  test('filters entries with an invalid disponibilite', () => {
    assert.equal(validateTissus([{ ...VALID, disponibilite: 'epuise'    }]).length, 0, 'missing accent');
    assert.equal(validateTissus([{ ...VALID, disponibilite: 'Disponible' }]).length, 0, 'wrong case');
    assert.equal(validateTissus([{ ...VALID, disponibilite: ''           }]).length, 0, 'empty');
    assert.equal(validateTissus([{ ...VALID, disponibilite: null         }]).length, 0, 'null');
  });

  test('accepts all valid disponibilite values', () => {
    assert.equal(validateTissus([{ ...VALID, disponibilite: 'disponible' }]).length, 1);
    assert.equal(validateTissus([{ ...VALID, disponibilite: 'limité'     }]).length, 1);
    assert.equal(validateTissus([{ ...VALID, disponibilite: 'épuisé'     }]).length, 1);
  });
});

// ── validateBijoux ────────────────────────────────────────────

describe('validateBijoux', () => {
  const VALID = {
    id: 'collier-ras-de-cou',
    name: 'Collier ras de cou',
    price: 15,
    base: ['or', 'argent'],
    image: 'images/bijoux/collier-ras-de-cou.avif',
  };

  test('accepts a valid array', () => {
    const result = validateBijoux([VALID]);
    assert.equal(result.length, 1);
    assert.deepEqual(result[0], VALID);
  });

  test('returns [] when input is not an array', () => {
    assert.deepEqual(validateBijoux(null),   []);
    assert.deepEqual(validateBijoux({}),     []);
    assert.deepEqual(validateBijoux('text'), []);
  });

  test('filters entries with an invalid id', () => {
    assert.equal(validateBijoux([{ ...VALID, id: ''   }]).length, 0, 'empty id');
    assert.equal(validateBijoux([{ ...VALID, id: null }]).length, 0, 'null id');
  });

  test('filters entries with an invalid name', () => {
    assert.equal(validateBijoux([{ ...VALID, name: ''   }]).length, 0, 'empty name');
    assert.equal(validateBijoux([{ ...VALID, name: null }]).length, 0, 'null name');
  });

  test('filters entries with an invalid price', () => {
    assert.equal(validateBijoux([{ ...VALID, price: -1   }]).length, 0, 'negative price');
    assert.equal(validateBijoux([{ ...VALID, price: '15' }]).length, 0, 'string price');
  });

  test('accepts price = 0', () => {
    assert.equal(validateBijoux([{ ...VALID, price: 0 }]).length, 1);
  });

  test('filters entries with an invalid base', () => {
    assert.equal(validateBijoux([{ ...VALID, base: []              }]).length, 0, 'empty array');
    assert.equal(validateBijoux([{ ...VALID, base: null            }]).length, 0, 'null');
    assert.equal(validateBijoux([{ ...VALID, base: 'or'            }]).length, 0, 'string instead of array');
    assert.equal(validateBijoux([{ ...VALID, base: ['platine']     }]).length, 0, 'unknown value');
    assert.equal(validateBijoux([{ ...VALID, base: ['or', 'other'] }]).length, 0, 'mixed valid/invalid');
  });

  test('accepts base with a single valid value', () => {
    assert.equal(validateBijoux([{ ...VALID, base: ['or']     }]).length, 1, 'or only');
    assert.equal(validateBijoux([{ ...VALID, base: ['argent'] }]).length, 1, 'argent only');
  });

  test('filters entries with an invalid image', () => {
    assert.equal(validateBijoux([{ ...VALID, image: ''   }]).length, 0, 'empty image');
    assert.equal(validateBijoux([{ ...VALID, image: null }]).length, 0, 'null image');
  });
});
