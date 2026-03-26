// tests/validate.test.js — Unit tests for js/validate.js
// Run with: npm test

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

  test('accepte un tableau d\'entrées valides', () => {
    const result = validateCouture([VALID]);
    assert.equal(result.length, 1);
    assert.deepEqual(result[0], VALID);
  });

  test('retourne [] si l\'entrée n\'est pas un tableau', () => {
    assert.deepEqual(validateCouture(null),      []);
    assert.deepEqual(validateCouture(undefined), []);
    assert.deepEqual(validateCouture({}),        []);
    assert.deepEqual(validateCouture('texte'),   []);
  });

  test('filtre les entrées avec un id invalide', () => {
    assert.equal(validateCouture([{ ...VALID, id: ''   }]).length, 0, 'id vide');
    assert.equal(validateCouture([{ ...VALID, id: 42   }]).length, 0, 'id nombre');
    assert.equal(validateCouture([{ ...VALID, id: null }]).length, 0, 'id null');
  });

  test('filtre les entrées avec un name invalide', () => {
    assert.equal(validateCouture([{ ...VALID, name: ''   }]).length, 0, 'name vide');
    assert.equal(validateCouture([{ ...VALID, name: null }]).length, 0, 'name null');
  });

  test('filtre les entrées avec un price invalide', () => {
    assert.equal(validateCouture([{ ...VALID, price: -1   }]).length, 0, 'price négatif');
    assert.equal(validateCouture([{ ...VALID, price: '15' }]).length, 0, 'price string');
    assert.equal(validateCouture([{ ...VALID, price: null }]).length, 0, 'price null');
  });

  test('accepte price = 0 (prix sur devis)', () => {
    assert.equal(validateCouture([{ ...VALID, price: 0 }]).length, 1);
  });

  test('filtre les entrées avec une description invalide', () => {
    assert.equal(validateCouture([{ ...VALID, description: ''   }]).length, 0, 'description vide');
    assert.equal(validateCouture([{ ...VALID, description: null }]).length, 0, 'description null');
  });

  test('filtre les entrées avec une image invalide', () => {
    assert.equal(validateCouture([{ ...VALID, image: ''   }]).length, 0, 'image vide');
    assert.equal(validateCouture([{ ...VALID, image: null }]).length, 0, 'image null');
  });

  test('conserve seulement les entrées valides dans un tableau mixte', () => {
    const result = validateCouture([
      VALID,
      { ...VALID, id: 'tote-bag', name: 'Tote bag' },
      { ...VALID, id: '',    name: 'Invalide — id vide' },
      { ...VALID, id: 'bad', price: -5 },
    ]);
    assert.equal(result.length, 2);
    assert.equal(result[0].id, 'bob');
    assert.equal(result[1].id, 'tote-bag');
  });

  test('retourne [] pour un tableau vide', () => {
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

  test('accepte un tableau d\'entrées valides', () => {
    const result = validateTissus([VALID]);
    assert.equal(result.length, 1);
    assert.deepEqual(result[0], VALID);
  });

  test('retourne [] si l\'entrée n\'est pas un tableau', () => {
    assert.deepEqual(validateTissus(null),    []);
    assert.deepEqual(validateTissus({}),      []);
    assert.deepEqual(validateTissus('texte'), []);
  });

  test('filtre les entrées avec un id invalide', () => {
    assert.equal(validateTissus([{ ...VALID, id: 0      }]).length, 0, 'id zéro');
    assert.equal(validateTissus([{ ...VALID, id: -1     }]).length, 0, 'id négatif');
    assert.equal(validateTissus([{ ...VALID, id: '1'   }]).length, 0, 'id string');
    assert.equal(validateTissus([{ ...VALID, id: 1.5   }]).length, 0, 'id décimal');
    assert.equal(validateTissus([{ ...VALID, id: null  }]).length, 0, 'id null');
  });

  test('filtre les entrées avec une image invalide', () => {
    assert.equal(validateTissus([{ ...VALID, image: ''   }]).length, 0, 'image vide');
    assert.equal(validateTissus([{ ...VALID, image: null }]).length, 0, 'image null');
  });

  test('filtre les entrées avec une disponibilite invalide', () => {
    assert.equal(validateTissus([{ ...VALID, disponibilite: 'epuise'    }]).length, 0, 'sans accent');
    assert.equal(validateTissus([{ ...VALID, disponibilite: 'Disponible' }]).length, 0, 'majuscule');
    assert.equal(validateTissus([{ ...VALID, disponibilite: ''           }]).length, 0, 'vide');
    assert.equal(validateTissus([{ ...VALID, disponibilite: null         }]).length, 0, 'null');
  });

  test('accepte toutes les valeurs de disponibilite valides', () => {
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

  test('accepte un tableau d\'entrées valides', () => {
    const result = validateBijoux([VALID]);
    assert.equal(result.length, 1);
    assert.deepEqual(result[0], VALID);
  });

  test('retourne [] si l\'entrée n\'est pas un tableau', () => {
    assert.deepEqual(validateBijoux(null),    []);
    assert.deepEqual(validateBijoux({}),      []);
    assert.deepEqual(validateBijoux('texte'), []);
  });

  test('filtre les entrées avec un id invalide', () => {
    assert.equal(validateBijoux([{ ...VALID, id: ''   }]).length, 0, 'id vide');
    assert.equal(validateBijoux([{ ...VALID, id: null }]).length, 0, 'id null');
  });

  test('filtre les entrées avec un name invalide', () => {
    assert.equal(validateBijoux([{ ...VALID, name: ''   }]).length, 0, 'name vide');
    assert.equal(validateBijoux([{ ...VALID, name: null }]).length, 0, 'name null');
  });

  test('filtre les entrées avec un price invalide', () => {
    assert.equal(validateBijoux([{ ...VALID, price: -1   }]).length, 0, 'price négatif');
    assert.equal(validateBijoux([{ ...VALID, price: '15' }]).length, 0, 'price string');
  });

  test('accepte price = 0', () => {
    assert.equal(validateBijoux([{ ...VALID, price: 0 }]).length, 1);
  });

  test('filtre les entrées avec une base invalide', () => {
    assert.equal(validateBijoux([{ ...VALID, base: []              }]).length, 0, 'base vide');
    assert.equal(validateBijoux([{ ...VALID, base: null            }]).length, 0, 'base null');
    assert.equal(validateBijoux([{ ...VALID, base: 'or'            }]).length, 0, 'base string');
    assert.equal(validateBijoux([{ ...VALID, base: ['platine']     }]).length, 0, 'base valeur inconnue');
    assert.equal(validateBijoux([{ ...VALID, base: ['or', 'autre'] }]).length, 0, 'base mixte invalide');
  });

  test('accepte base avec une seule valeur valide', () => {
    assert.equal(validateBijoux([{ ...VALID, base: ['or']     }]).length, 1, 'base or seul');
    assert.equal(validateBijoux([{ ...VALID, base: ['argent'] }]).length, 1, 'base argent seul');
  });

  test('filtre les entrées avec une image invalide', () => {
    assert.equal(validateBijoux([{ ...VALID, image: ''   }]).length, 0, 'image vide');
    assert.equal(validateBijoux([{ ...VALID, image: null }]).length, 0, 'image null');
  });
});
