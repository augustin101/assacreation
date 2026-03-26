// @vitest-environment jsdom
// tests/order-form.test.js — Integration tests for the order form

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';

// ── Fixtures ──────────────────────────────────────────────────

const COUTURE_FIXTURE = [
  { id: 'bob',      name: 'Bob',      price: 15, description: 'Bob wax.',  image: 'images/couture/bob.avif'      },
  { id: 'tote-bag', name: 'Tote bag', price: 0,  description: 'Tote bag.', image: 'images/couture/tote-bag.avif' },
];
const TISSUS_FIXTURE = [
  { id: 1, image: 'images/tissus/tissu-01.avif', disponibilite: 'disponible' },
];
const BIJOUX_FIXTURE = [
  { id: 'collier',  name: 'Collier',  price: 15, base: ['or', 'argent'], image: 'images/bijoux/collier.avif'  },
  { id: 'bracelet', name: 'Bracelet', price: 8,  base: ['or'],           image: 'images/bijoux/bracelet.avif' },
];

// Minimal faithful reproduction of commander.html structure
const FORM_HTML = `
  <div class="order-counter" id="order-counter">
    <span><span class="counter-value">0</span> / 5 articles</span>
  </div>
  <form id="order-form" action="https://formspree.io/f/test" novalidate>
    <input type="hidden" name="Catégorie"          id="cat-hidden"   value="">
    <input type="hidden" name="Nombre d'articles"  id="qty-hidden"   value="">
    <input type="hidden" name="Prix total estimé"  id="price-hidden" value="">

    <fieldset class="form-section">
      <div class="radio-cards">
        <label class="radio-card">
          <input type="radio" name="_categorie" value="couture" required>
          <div class="radio-card-inner"><span class="radio-card-label">Couture</span></div>
        </label>
        <label class="radio-card">
          <input type="radio" name="_categorie" value="bijoux" required>
          <div class="radio-card-inner"><span class="radio-card-label">Bijoux</span></div>
        </label>
      </div>
    </fieldset>

    <div id="section-couture" hidden>
      <fieldset class="form-section">
        <div id="articles-selector" class="articles-list"></div>
      </fieldset>
      <fieldset class="form-section">
        <textarea id="precisions-couture" name="precisions_couture"></textarea>
      </fieldset>
    </div>

    <div id="section-bijoux" hidden>
      <fieldset class="form-section">
        <div id="bijoux-items" class="articles-list"></div>
        <div class="bijou-add-wrap">
          <button type="button" id="add-bijou-btn">+ Ajouter un bijou</button>
        </div>
      </fieldset>
    </div>

    <fieldset class="form-section">
      <div class="form-row">
        <div class="form-group">
          <input type="text"  id="prenom" name="prenom" required>
        </div>
        <div class="form-group">
          <input type="text"  id="nom"    name="nom"    required>
        </div>
      </div>
      <div class="form-group">
        <input type="email" id="email"   name="email"  required>
      </div>
      <div class="form-group">
        <textarea id="message" name="message"></textarea>
      </div>
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" name="livraison" value="oui">
        </label>
      </div>
    </fieldset>

    <div id="price-summary" hidden>
      <div class="price-summary-row">
        <span id="price-total"></span>
      </div>
    </div>

    <div class="form-submit">
      <button type="submit">Envoyer ma commande</button>
    </div>
  </form>
  <div id="form-confirmation" hidden></div>
`;

// ── Setup helpers ─────────────────────────────────────────────

function makeFetchMock({ submissionOk = true } = {}) {
  return vi.fn(async (url) => {
    if (url.includes('couture.json')) return { ok: true, json: async () => COUTURE_FIXTURE };
    if (url.includes('tissus.json'))  return { ok: true, json: async () => TISSUS_FIXTURE };
    if (url.includes('bijoux.json'))  return { ok: true, json: async () => BIJOUX_FIXTURE };
    // Formspree submission call
    return {
      ok: submissionOk,
      json: async () => submissionOk ? {} : { errors: [{ message: 'Server error' }] },
    };
  });
}

async function setup(opts = {}) {
  vi.resetModules();
  document.body.innerHTML = FORM_HTML;
  vi.stubGlobal('fetch', makeFetchMock(opts));
  vi.stubGlobal('alert', vi.fn());
  const mod = await import('../js/order-form.js');
  await mod.initPromise;
  return mod;
}

// Shorthand DOM accessors
const $  = id  => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function fillContact({ prenom = 'Marie', nom = 'Dupont', email = 'marie@exemple.fr' } = {}) {
  $('prenom').value = prenom;
  $('nom').value    = nom;
  $('email').value  = email;
}

function selectCategory(value) {
  const radio = document.querySelector(`input[name="_categorie"][value="${value}"]`);
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
}

function checkArticle(id) {
  const cb = document.querySelector(`input[type="checkbox"][data-id="${id}"]`);
  cb.checked = true;
  cb.dispatchEvent(new Event('change', { bubbles: true }));
  return cb;
}

function submitForm() {
  $('order-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

// Simulate a valid bijou row by clicking through the actual picker modal.
// Uses 'bracelet' (base: ['or'], price: 8) so metal is auto-set and no
// radio interaction is needed.
function addValidBijouRow() {
  $('add-bijou-btn').click();
  // Open the picker via the trigger button on the newly-added row
  $('bijoux-items').lastElementChild.querySelector('.bijou-trigger').click();
  // Select 'bracelet' — single-base so selectBijou auto-sets metalHidden
  document.querySelector('[data-bijoux-id="bracelet"]').click();
}

// Simulate a valid couture article with a fabric selected.
function selectArticleWithFabric(articleId) {
  checkArticle(articleId);
  const fabricInput = document.querySelector(`input[name="tissu_${articleId}_1"]`);
  if (fabricInput) fabricInput.value = '1';
}

// ── Pure function: validateContactFields ─────────────────────

describe('validateContactFields', () => {
  let validateContactFields;

  beforeEach(async () => {
    const mod = await setup();
    validateContactFields = mod.validateContactFields;
  });
  afterEach(() => vi.unstubAllGlobals());

  test('returns null for valid inputs', () => {
    expect(validateContactFields({ prenom: 'Marie', nom: 'Dupont', email: 'marie@exemple.fr' })).toBeNull();
  });

  test('returns prenom error when empty', () => {
    expect(validateContactFields({ prenom: '', nom: 'Dupont', email: 'marie@exemple.fr' }))
      .toMatchObject({ field: 'prenom' });
  });

  test('returns prenom error for whitespace-only', () => {
    expect(validateContactFields({ prenom: '   ', nom: 'Dupont', email: 'marie@exemple.fr' }))
      .toMatchObject({ field: 'prenom' });
  });

  test('returns nom error when empty', () => {
    expect(validateContactFields({ prenom: 'Marie', nom: '', email: 'marie@exemple.fr' }))
      .toMatchObject({ field: 'nom' });
  });

  test('returns email error when empty', () => {
    expect(validateContactFields({ prenom: 'Marie', nom: 'Dupont', email: '' }))
      .toMatchObject({ field: 'email' });
  });

  test('returns email error for invalid format', () => {
    const invalid = ['notanemail', 'no@dots', '@nodomain.com', 'spaces in@email.com'];
    for (const email of invalid) {
      expect(validateContactFields({ prenom: 'M', nom: 'D', email }))
        .toMatchObject({ field: 'email' });
    }
  });

  test('accepts valid email formats', () => {
    const valid = ['a@b.co', 'marie@exemple.fr', 'user+tag@sub.domain.com', 'x@y.museum'];
    for (const email of valid) {
      expect(validateContactFields({ prenom: 'M', nom: 'D', email })).toBeNull();
    }
  });
});

// ── Initialisation ────────────────────────────────────────────

describe('form initialisation', () => {
  beforeEach(setup);
  afterEach(() => vi.unstubAllGlobals());

  test('price-hidden starts as "—"', () => {
    expect($('price-hidden').value).toBe('—');
  });

  test('qty-hidden starts at "0"', () => {
    expect($('qty-hidden').value).toBe('0');
  });

  test('couture and bijoux sections are both hidden', () => {
    expect($('section-couture').hidden).toBe(true);
    expect($('section-bijoux').hidden).toBe(true);
  });

  test('article list is populated from fixture data', () => {
    const rows = $$('#articles-selector .article-row');
    expect(rows).toHaveLength(COUTURE_FIXTURE.length);
  });
});

// ── Category selection ────────────────────────────────────────

describe('category selection', () => {
  beforeEach(setup);
  afterEach(() => vi.unstubAllGlobals());

  test('alerts when no category is selected on submit', () => {
    fillContact();
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/catégorie/i));
  });

  test('shows couture section and hides bijoux when couture selected', () => {
    selectCategory('couture');
    expect($('section-couture').hidden).toBe(false);
    expect($('section-bijoux').hidden).toBe(true);
  });

  test('shows bijoux section and hides couture when bijoux selected', () => {
    selectCategory('bijoux');
    expect($('section-bijoux').hidden).toBe(false);
    expect($('section-couture').hidden).toBe(true);
  });

  test('switching categories swaps visible section', () => {
    selectCategory('couture');
    selectCategory('bijoux');
    expect($('section-bijoux').hidden).toBe(false);
    expect($('section-couture').hidden).toBe(true);
  });
});

// ── Couture validation ────────────────────────────────────────

describe('couture validation', () => {
  beforeEach(setup);
  afterEach(() => vi.unstubAllGlobals());

  test('alerts when no article is checked', () => {
    selectCategory('couture');
    fillContact();
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/article/i));
  });

  test('alerts when article is checked but no fabric selected', () => {
    selectCategory('couture');
    checkArticle('bob');
    fillContact();
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/tissu/i));
  });

  test('marks the unselected fabric trigger with is-missing', () => {
    selectCategory('couture');
    checkArticle('bob');
    fillContact();
    submitForm();
    expect(document.querySelector('.fabric-trigger').classList.contains('is-missing')).toBe(true);
  });

  test('fabric strip is added when article is checked', () => {
    selectCategory('couture');
    checkArticle('bob');
    expect(document.querySelector('.article-fabric-strip')).not.toBeNull();
  });

  test('fabric strip has one trigger per quantity', () => {
    selectCategory('couture');
    checkArticle('bob');
    expect($$('.fabric-pick')).toHaveLength(1);
  });
});

// ── Bijoux validation ─────────────────────────────────────────

describe('bijoux validation', () => {
  beforeEach(setup);
  afterEach(() => vi.unstubAllGlobals());

  test('alerts when no bijou row is added', () => {
    selectCategory('bijoux');
    fillContact();
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/bijou/i));
  });

  test('alerts when bijou row has no model selected', () => {
    selectCategory('bijoux');
    $('add-bijou-btn').click();
    fillContact();
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/bijou/i));
  });

  test('marks empty bijou trigger with is-missing', () => {
    selectCategory('bijoux');
    $('add-bijou-btn').click();
    fillContact();
    submitForm();
    expect(document.querySelector('.bijou-trigger').classList.contains('is-missing')).toBe(true);
  });

  test('alerts when metal choice missing for multi-base bijou', () => {
    selectCategory('bijoux');
    $('add-bijou-btn').click();
    const row        = document.querySelector('.bijou-item-row');
    const metalGroup = row.querySelector('.bijou-metal-group');
    // Simulate user having picked a multi-base bijou via modal:
    // model is set, metal group is visible, but no metal radio chosen yet.
    row.querySelector('input[name^="bijou_"]:not(.bijou-metal-hidden)').value = 'Collier';
    metalGroup.hidden = false; // revealed by selectBijou() when base has multiple options
    // metalHidden.value stays '' → triggers metal-missing validation
    fillContact();
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/métal/i));
  });

  test('add button creates a new bijou row', () => {
    selectCategory('bijoux');
    $('add-bijou-btn').click();
    $('add-bijou-btn').click();
    expect($$('.bijou-item-row')).toHaveLength(2);
  });

  test('remove button deletes the row', () => {
    selectCategory('bijoux');
    $('add-bijou-btn').click();
    document.querySelector('.remove-bijou-btn').click();
    expect($$('.bijou-item-row')).toHaveLength(0);
  });
});

// ── Contact field validation ──────────────────────────────────

describe('contact field validation (integration)', () => {
  beforeEach(setup);
  afterEach(() => vi.unstubAllGlobals());

  // Reach contact validation by providing a fully valid bijoux order
  function setupValidBijoux() {
    selectCategory('bijoux');
    addValidBijouRow();
  }

  test('alerts when prenom is missing', () => {
    setupValidBijoux();
    fillContact({ prenom: '', nom: 'Dupont', email: 'marie@exemple.fr' });
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/prénom/i));
  });

  test('alerts when prenom is whitespace only', () => {
    setupValidBijoux();
    fillContact({ prenom: '   ', nom: 'Dupont', email: 'marie@exemple.fr' });
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/prénom/i));
  });

  test('alerts when nom is missing', () => {
    setupValidBijoux();
    fillContact({ prenom: 'Marie', nom: '', email: 'marie@exemple.fr' });
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/nom/i));
  });

  test('alerts when email is missing', () => {
    setupValidBijoux();
    fillContact({ prenom: 'Marie', nom: 'Dupont', email: '' });
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/email/i));
  });

  test('alerts when email format is invalid', () => {
    setupValidBijoux();
    fillContact({ prenom: 'Marie', nom: 'Dupont', email: 'not-an-email' });
    submitForm();
    expect(alert).toHaveBeenCalledWith(expect.stringMatching(/email/i));
  });

  test('does not alert for valid contact fields', () => {
    setupValidBijoux();
    fillContact();
    submitForm();
    // alert may be called for other reasons, but not for contact fields
    const contactAlerts = vi.mocked(alert).mock.calls.filter(([msg]) =>
      /prénom|^.*nom.*$|email/i.test(msg),
    );
    expect(contactAlerts).toHaveLength(0);
  });
});

// ── Price and quantity propagation ────────────────────────────

describe('price and quantity propagation', () => {
  beforeEach(setup);
  afterEach(() => vi.unstubAllGlobals());

  test('qty updates to 1 when a couture article is checked', () => {
    selectCategory('couture');
    checkArticle('bob');
    expect($('qty-hidden').value).toBe('1');
  });

  test('price updates when a priced article is checked', () => {
    selectCategory('couture');
    checkArticle('bob'); // price = 15
    // toLocaleString output varies by platform; test the € symbol and the number
    expect($('price-hidden').value).toMatch(/15.*€/);
  });

  test('price stays "—" when only a price=0 article is checked', () => {
    selectCategory('couture');
    checkArticle('tote-bag'); // price = 0
    expect($('price-hidden').value).toBe('—');
  });

  test('qty updates to 1 when a bijou row is added', () => {
    selectCategory('bijoux');
    $('add-bijou-btn').click();
    expect($('qty-hidden').value).toBe('1');
  });

  test('qty updates to 0 when the bijou row is removed', () => {
    selectCategory('bijoux');
    $('add-bijou-btn').click();
    document.querySelector('.remove-bijou-btn').click();
    expect($('qty-hidden').value).toBe('0');
  });

  test('price-summary is visible after a priced article is checked', () => {
    selectCategory('couture');
    checkArticle('bob');
    expect($('price-summary').hidden).toBe(false);
  });

  test('price-summary is hidden after unchecking the only priced article', () => {
    selectCategory('couture');
    checkArticle('bob');
    const cb = document.querySelector('input[data-id="bob"]');
    cb.checked = false;
    cb.dispatchEvent(new Event('change', { bubbles: true }));
    expect($('price-summary').hidden).toBe(true);
  });

  test('price updates after a bijou is selected via the picker', () => {
    selectCategory('bijoux');
    addValidBijouRow(); // bracelet, price = 8
    expect($('price-hidden').value).toMatch(/8.*€/);
  });

  test('couture prices are not counted when bijoux is active', () => {
    // check a couture article first, then switch to bijoux
    selectCategory('couture');
    checkArticle('bob'); // price = 15
    selectCategory('bijoux');
    // no bijoux items added — price should be '—', not '15 €'
    expect($('price-hidden').value).toBe('—');
  });
});

// ── Form submission ───────────────────────────────────────────

describe('form submission', () => {
  afterEach(() => vi.unstubAllGlobals());

  test('calls fetch POST to formspree on valid couture submission', async () => {
    await setup();
    selectCategory('couture');
    selectArticleWithFabric('bob');
    fillContact();
    submitForm();
    await vi.waitFor(() => {
      const submissionCall = fetch.mock.calls.find(([url]) => url.includes('formspree'));
      expect(submissionCall).toBeDefined();
      expect(submissionCall[1].method).toBe('POST');
    });
  });

  test('calls fetch POST to formspree on valid bijoux submission', async () => {
    await setup();
    selectCategory('bijoux');
    addValidBijouRow();
    fillContact();
    submitForm();
    await vi.waitFor(() => {
      const submissionCall = fetch.mock.calls.find(([url]) => url.includes('formspree'));
      expect(submissionCall).toBeDefined();
    });
  });

  test('shows confirmation and hides form on success', async () => {
    await setup();
    selectCategory('bijoux');
    addValidBijouRow();
    fillContact();
    submitForm();
    await vi.waitFor(() => {
      expect($('form-confirmation').hidden).toBe(false);
      expect($('order-form').hidden).toBe(true);
    });
  });

  test('bijoux submission does not include couture fields, _categorie, or raw _metal radios', async () => {
    await setup();
    // First interact with couture section so its fields exist in the DOM
    selectCategory('couture');
    checkArticle('bob');
    // Then switch to bijoux
    selectCategory('bijoux');
    addValidBijouRow();
    fillContact();
    submitForm();
    await vi.waitFor(() => {
      const call = fetch.mock.calls.find(([url]) => url.includes('formspree'));
      expect(call).toBeDefined();
      const body = call[1].body;
      // Inactive couture section fields must be absent
      expect(body.has('articles')).toBe(false);
      expect(body.has('qty_bob')).toBe(false);
      // Raw internal radio fields must be stripped
      expect(body.has('_categorie')).toBe(false);
      // Raw _metal_N radios inside bijoux rows must be stripped
      expect(body.has('_metal_1')).toBe(false);
      // Human-readable fields must still be present
      expect(body.has('Catégorie')).toBe(true);
      expect(body.get('bijou_1')).toBe('Bracelet');
    });
  });

  test('shows alert and re-enables button on server error', async () => {
    await setup({ submissionOk: false });
    selectCategory('bijoux');
    addValidBijouRow();
    fillContact();
    submitForm();
    await vi.waitFor(() => {
      expect(alert).toHaveBeenCalledWith(expect.stringMatching(/Server error/));
      expect($('order-form').querySelector('[type="submit"]').disabled).toBe(false);
    });
  });
});
