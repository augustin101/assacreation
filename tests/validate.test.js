// tests/validate.test.js — Unit tests for js/validate.js

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { validateCouture, validateTissus, validateBijoux } from '../js/validate.js';

// Suppress expected [Assa] warnings produced by intentionally invalid test data
beforeAll(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
afterAll(() => console.warn.mockRestore());

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
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(VALID);
  });

  test('returns [] when input is not an array', () => {
    expect(validateCouture(null)).toEqual([]);
    expect(validateCouture(undefined)).toEqual([]);
    expect(validateCouture({})).toEqual([]);
    expect(validateCouture('text')).toEqual([]);
  });

  test('filters entries with an invalid id', () => {
    expect(validateCouture([{ ...VALID, id: ''   }])).toHaveLength(0);
    expect(validateCouture([{ ...VALID, id: 42   }])).toHaveLength(0);
    expect(validateCouture([{ ...VALID, id: null }])).toHaveLength(0);
  });

  test('filters entries with an invalid name', () => {
    expect(validateCouture([{ ...VALID, name: ''   }])).toHaveLength(0);
    expect(validateCouture([{ ...VALID, name: null }])).toHaveLength(0);
  });

  test('filters entries with an invalid price', () => {
    expect(validateCouture([{ ...VALID, price: -1   }])).toHaveLength(0);
    expect(validateCouture([{ ...VALID, price: '15' }])).toHaveLength(0);
    expect(validateCouture([{ ...VALID, price: null }])).toHaveLength(0);
  });

  test('accepts price = 0 (quote on request)', () => {
    expect(validateCouture([{ ...VALID, price: 0 }])).toHaveLength(1);
  });

  test('filters entries with an invalid description', () => {
    expect(validateCouture([{ ...VALID, description: ''   }])).toHaveLength(0);
    expect(validateCouture([{ ...VALID, description: null }])).toHaveLength(0);
  });

  test('filters entries with an invalid image', () => {
    expect(validateCouture([{ ...VALID, image: ''   }])).toHaveLength(0);
    expect(validateCouture([{ ...VALID, image: null }])).toHaveLength(0);
  });

  test('keeps only valid entries from a mixed array', () => {
    const result = validateCouture([
      VALID,
      { ...VALID, id: 'tote-bag', name: 'Tote bag' },
      { ...VALID, id: '',    name: 'Invalid — empty id' },
      { ...VALID, id: 'bad', price: -5 },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('bob');
    expect(result[1].id).toBe('tote-bag');
  });

  test('returns [] for an empty array', () => {
    expect(validateCouture([])).toEqual([]);
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
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(VALID);
  });

  test('returns [] when input is not an array', () => {
    expect(validateTissus(null)).toEqual([]);
    expect(validateTissus({})).toEqual([]);
    expect(validateTissus('text')).toEqual([]);
  });

  test('filters entries with an invalid id', () => {
    expect(validateTissus([{ ...VALID, id: 0    }])).toHaveLength(0);
    expect(validateTissus([{ ...VALID, id: -1   }])).toHaveLength(0);
    expect(validateTissus([{ ...VALID, id: '1'  }])).toHaveLength(0);
    expect(validateTissus([{ ...VALID, id: 1.5  }])).toHaveLength(0);
    expect(validateTissus([{ ...VALID, id: null }])).toHaveLength(0);
  });

  test('filters entries with an invalid image', () => {
    expect(validateTissus([{ ...VALID, image: ''   }])).toHaveLength(0);
    expect(validateTissus([{ ...VALID, image: null }])).toHaveLength(0);
  });

  test('filters entries with an invalid disponibilite', () => {
    expect(validateTissus([{ ...VALID, disponibilite: 'epuise'    }])).toHaveLength(0);
    expect(validateTissus([{ ...VALID, disponibilite: 'Disponible' }])).toHaveLength(0);
    expect(validateTissus([{ ...VALID, disponibilite: ''           }])).toHaveLength(0);
    expect(validateTissus([{ ...VALID, disponibilite: null         }])).toHaveLength(0);
  });

  test('accepts all valid disponibilite values', () => {
    expect(validateTissus([{ ...VALID, disponibilite: 'disponible' }])).toHaveLength(1);
    expect(validateTissus([{ ...VALID, disponibilite: 'limité'     }])).toHaveLength(1);
    expect(validateTissus([{ ...VALID, disponibilite: 'épuisé'     }])).toHaveLength(1);
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
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(VALID);
  });

  test('returns [] when input is not an array', () => {
    expect(validateBijoux(null)).toEqual([]);
    expect(validateBijoux({})).toEqual([]);
    expect(validateBijoux('text')).toEqual([]);
  });

  test('filters entries with an invalid id', () => {
    expect(validateBijoux([{ ...VALID, id: ''   }])).toHaveLength(0);
    expect(validateBijoux([{ ...VALID, id: null }])).toHaveLength(0);
  });

  test('filters entries with an invalid name', () => {
    expect(validateBijoux([{ ...VALID, name: ''   }])).toHaveLength(0);
    expect(validateBijoux([{ ...VALID, name: null }])).toHaveLength(0);
  });

  test('filters entries with an invalid price', () => {
    expect(validateBijoux([{ ...VALID, price: -1   }])).toHaveLength(0);
    expect(validateBijoux([{ ...VALID, price: '15' }])).toHaveLength(0);
  });

  test('accepts price = 0', () => {
    expect(validateBijoux([{ ...VALID, price: 0 }])).toHaveLength(1);
  });

  test('filters entries with an invalid base', () => {
    expect(validateBijoux([{ ...VALID, base: []              }])).toHaveLength(0);
    expect(validateBijoux([{ ...VALID, base: null            }])).toHaveLength(0);
    expect(validateBijoux([{ ...VALID, base: 'or'            }])).toHaveLength(0);
    expect(validateBijoux([{ ...VALID, base: ['platine']     }])).toHaveLength(0);
    expect(validateBijoux([{ ...VALID, base: ['or', 'other'] }])).toHaveLength(0);
  });

  test('accepts base with a single valid value', () => {
    expect(validateBijoux([{ ...VALID, base: ['or']     }])).toHaveLength(1);
    expect(validateBijoux([{ ...VALID, base: ['argent'] }])).toHaveLength(1);
  });

  test('filters entries with an invalid image', () => {
    expect(validateBijoux([{ ...VALID, image: ''   }])).toHaveLength(0);
    expect(validateBijoux([{ ...VALID, image: null }])).toHaveLength(0);
  });
});
