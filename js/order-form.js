// order-form.js — Dynamic order form (couture article selector + bijoux item picker)

import { validateCouture, validateTissus, validateBijoux } from './validate.js';

let tissusData = [];
let bijouxData = [];

const MAX_PER_ARTICLE = 3;
const MAX_TOTAL       = 5; // shared limit across couture + bijoux

// ── Fabric availability labels ────────────────────────

const DISPO_LABELS = {
  disponible: 'Disponible',
  limité:     'Quantité limitée',
  épuisé:     'Épuisé',
};

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load: ${url}`);
  return res.json();
}

// ── Unified item count (couture qty + bijoux rows) ────

function getTotalQty() {
  let total = 0;
  document.querySelectorAll('#articles-selector .article-row').forEach(row => {
    const cb = row.querySelector('input[type="checkbox"]');
    if (cb?.checked) total += parseInt(row.querySelector('.qty-input')?.value || 0, 10);
  });
  total += document.querySelectorAll('.bijou-item-row').length;
  return total;
}

// Update the counter pill at the top of the form
function updateOrderCounter() {
  const el = document.getElementById('order-counter');
  if (!el) return;
  const total = getTotalQty();
  el.querySelector('.counter-value').textContent = total;
  el.classList.toggle('is-at-limit', total >= MAX_TOTAL);

  const qtyHidden = document.getElementById('qty-hidden');
  if (qtyHidden) qtyHidden.value = total;
}

// ── Quantity controls (couture) ───────────────────────

function updateCheckboxStates() {
  const currentTotal = getTotalQty();
  const allCheckboxes = document.querySelectorAll('input[name="articles"]');
  
  allCheckboxes.forEach(cb => {
    cb.disabled = currentTotal >= MAX_TOTAL && !cb.checked;
  });
}

// Disable +/- buttons that would exceed per-article (5) or global (5) limits
function updateQtyControls() {
  const total = getTotalQty();
  document.querySelectorAll('#articles-selector .article-row').forEach(row => {
    const cb       = row.querySelector('input[type="checkbox"]');
    const plusBtn  = row.querySelector('.qty-plus');
    const minusBtn = row.querySelector('.qty-minus');
    const qtyIn    = row.querySelector('.qty-input');
    if (!plusBtn || !qtyIn) return;
    const qty = parseInt(qtyIn.value, 10);
    plusBtn.disabled  = !cb?.checked || total >= MAX_TOTAL || qty >= MAX_PER_ARTICLE;
    minusBtn.disabled = !cb?.checked || qty <= 1;
  });
  updateCheckboxStates();
  updateAddBijouBtn();
  updateOrderCounter();
}

// ── Fabric selection modal ────────────────────────────

let fabricModalEl = null;
let activeFabricContext = null;

function buildFabricModal() {
  const el = document.createElement('div');
  el.className = 'fabric-modal';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.hidden = true;
  el.innerHTML = `
    <div class="fabric-modal-backdrop"></div>
    <div class="fabric-modal-panel">
      <div class="fabric-modal-header">
        <h3 class="fabric-modal-title"></h3>
        <button type="button" class="fabric-modal-close" aria-label="Fermer">&times;</button>
      </div>
      <div class="fabric-modal-grid"></div>
    </div>
  `;
  document.body.appendChild(el);

  const grid = el.querySelector('.fabric-modal-grid');
  tissusData.forEach(({ id, image, disponibilite }) => {
    const epuise = disponibilite === 'épuisé';
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = `fabric-modal-tile${epuise ? ' is-epuise' : ''}`;
    tile.dataset.fabricId  = id;
    tile.dataset.fabricImg = image;
    if (epuise) tile.disabled = true;
    tile.innerHTML = `
      <div class="fabric-modal-tile-img">
        <img src="${image}" alt="Tissu n°${id}" loading="lazy">
        <div class="fabric-modal-tile-check">✓</div>
      </div>
      <div class="fabric-modal-tile-footer">
        <span class="fabric-modal-tile-num">n°${id}</span>
        <span class="badge badge-${disponibilite}">${DISPO_LABELS[disponibilite]}</span>
      </div>
    `;
    tile.addEventListener('click', () => selectFabric(id, image));
    grid.appendChild(tile);
  });

  el.querySelector('.fabric-modal-backdrop').addEventListener('click', closeFabricModal);
  el.querySelector('.fabric-modal-close').addEventListener('click', closeFabricModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !fabricModalEl?.hidden) closeFabricModal();
  });

  return el;
}

function openFabricModal(articleId, pieceIndex, triggerBtn, hiddenInput) {
  if (!fabricModalEl) fabricModalEl = buildFabricModal();
  activeFabricContext = { articleId, pieceIndex, triggerBtn, hiddenInput };

  fabricModalEl.querySelector('.fabric-modal-title').textContent =
    `Choisir un tissu — Pièce ${pieceIndex}`;

  const currentId = hiddenInput.value;
  fabricModalEl.querySelectorAll('.fabric-modal-tile').forEach(tile => {
    tile.classList.toggle('is-selected', tile.dataset.fabricId === currentId);
  });

  fabricModalEl.hidden = false;
  document.body.classList.add('fabric-modal-active');
  fabricModalEl.querySelector('.fabric-modal-close').focus();
}

function closeFabricModal() {
  if (!fabricModalEl) return;
  fabricModalEl.hidden = true;
  document.body.classList.remove('fabric-modal-active');
  activeFabricContext?.triggerBtn?.focus();
  activeFabricContext = null;
}

function selectFabric(fabricId, fabricImage) {
  if (!activeFabricContext) return;
  const { triggerBtn, hiddenInput } = activeFabricContext;

  hiddenInput.value = fabricId;
  triggerBtn.querySelector('.fabric-trigger-thumb').innerHTML =
    `<img src="${fabricImage}" alt="Tissu n°${fabricId}" loading="lazy">`;
  triggerBtn.querySelector('.fabric-trigger-caption').textContent = `n°${fabricId}`;
  triggerBtn.classList.add('has-selection');
  triggerBtn.classList.remove('is-missing');

  closeFabricModal();
}

// ── Per-piece fabric trigger ──────────────────────────

function buildFabricPick(articleId, pieceIndex) {
  const wrap = document.createElement('div');
  wrap.className = 'fabric-pick';

  const label = document.createElement('span');
  label.className = 'fabric-pick-label';
  label.textContent = `Pièce ${pieceIndex}`;
  wrap.appendChild(label);

  const hiddenInput = document.createElement('input');
  hiddenInput.type  = 'hidden';
  hiddenInput.name  = `tissu_${articleId}_${pieceIndex}`;
  hiddenInput.value = '';
  wrap.appendChild(hiddenInput);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'fabric-trigger';
  btn.setAttribute('aria-label', `Choisir le tissu pour la pièce ${pieceIndex}`);
  btn.innerHTML = `
    <div class="fabric-trigger-thumb">
      <span class="fabric-trigger-placeholder" aria-hidden="true">+</span>
    </div>
    <span class="fabric-trigger-caption">Choisir</span>
  `;
  btn.addEventListener('click', () => openFabricModal(articleId, pieceIndex, btn, hiddenInput));
  wrap.appendChild(btn);

  return wrap;
}

// Rebuild fabric strip, preserving existing selections
function rebuildFabricStrip(row, articleId, qty) {
  const existing = row.querySelector('.article-fabric-strip');

  const saved = {};
  if (existing) {
    existing.querySelectorAll('.fabric-pick').forEach((pick, i) => {
      const pieceIndex = i + 1;
      const input = pick.querySelector(`input[name="tissu_${articleId}_${pieceIndex}"]`);
      if (input?.value) saved[pieceIndex] = input.value;
    });
    existing.remove();
  }

  if (qty < 1) return;

  const strip = document.createElement('div');
  strip.className = 'article-fabric-strip';
  for (let i = 1; i <= qty; i++) {
    const pick = buildFabricPick(articleId, i);

    if (saved[i]) {
      const fabricId = saved[i];
      const entry    = tissusData.find(t => String(t.id) === String(fabricId));
      const input    = pick.querySelector(`input[name="tissu_${articleId}_${i}"]`);
      const btn      = pick.querySelector('.fabric-trigger');
      if (entry && input && btn) {
        input.value = fabricId;
        btn.querySelector('.fabric-trigger-thumb').innerHTML =
          `<img src="${entry.image}" alt="Tissu n°${fabricId}" loading="lazy">`;
        btn.querySelector('.fabric-trigger-caption').textContent = `n°${fabricId}`;
        btn.classList.add('has-selection');
      }
    }

    strip.appendChild(pick);
  }
  row.appendChild(strip);
}

// ── Article checklist (couture) ───────────────────────

function renderArticlesSelector(couture) {
  const container = document.getElementById('articles-selector');
  if (!container) return;

  couture.forEach(({ id, name, price }) => {
    const row = document.createElement('div');
    row.className = 'article-row';

    const header = document.createElement('div');
    header.className = 'article-header';
    header.innerHTML = `
      <label class="article-check">
        <input type="checkbox" name="articles" value="${name}" data-price="${price}" data-name="${name}" data-id="${id}">
        <span class="article-name">${name}</span>
        ${price > 0 ? `<span class="article-price">${price.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>` : ''}
      </label>
      <div class="article-qty" hidden>
        <button type="button" class="qty-btn qty-minus" aria-label="Diminuer la quantité">−</button>
        <input type="number" name="qty_${id}" value="1" min="1" max="${MAX_PER_ARTICLE}" class="qty-input" aria-label="Quantité" readonly>
        <button type="button" class="qty-btn qty-plus" aria-label="Augmenter la quantité">+</button>
      </div>
    `;
    row.appendChild(header);

    const cb       = header.querySelector('input[type="checkbox"]');
    const qtyDiv   = header.querySelector('.article-qty');
    const qtyIn    = header.querySelector('.qty-input');
    const minusBtn = header.querySelector('.qty-minus');
    const plusBtn  = header.querySelector('.qty-plus');

    qtyIn.disabled = true;

    cb.addEventListener('change', () => {
      qtyDiv.hidden  = !cb.checked;
      qtyIn.disabled = !cb.checked;
      rebuildFabricStrip(row, id, cb.checked ? parseInt(qtyIn.value, 10) : 0);
      updateQtyControls();
      updatePriceSummary();
    });

    function changeQty(delta) {
      const current          = parseInt(qtyIn.value, 10);
      const totalWithoutThis = getTotalQty() - current;
      const maxAllowed       = Math.min(MAX_PER_ARTICLE, MAX_TOTAL - totalWithoutThis);
      const newQty           = Math.max(1, Math.min(maxAllowed, current + delta));
      if (newQty === current) return;
      qtyIn.value = newQty;
      rebuildFabricStrip(row, id, newQty);
      updateQtyControls();
      updatePriceSummary();
    }

    minusBtn.addEventListener('click', () => changeQty(-1));
    plusBtn.addEventListener('click',  () => changeQty(+1));

    container.appendChild(row);
  });
}

// ── Bijoux item picker modal ──────────────────────────

let bijouModalEl      = null;
let activeBijouContext = null;
let bijouItemCounter  = 0; // unique suffix for form field names

function buildBijouModal() {
  const el = document.createElement('div');
  el.className = 'fabric-modal'; // reuses the same CSS
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.hidden = true;
  el.innerHTML = `
    <div class="fabric-modal-backdrop"></div>
    <div class="fabric-modal-panel">
      <div class="fabric-modal-header">
        <h3 class="fabric-modal-title">Choisir un bijou</h3>
        <button type="button" class="fabric-modal-close" aria-label="Fermer">&times;</button>
      </div>
      <div class="fabric-modal-grid bijou-modal-grid"></div>
    </div>
  `;
  document.body.appendChild(el);

  const grid = el.querySelector('.bijou-modal-grid');
  bijouxData.forEach(({ id, name, price, base, image }) => {
    const tile = document.createElement('button');
    tile.type  = 'button';
    tile.className = 'fabric-modal-tile';
    tile.dataset.bijouxId    = id;
    tile.dataset.bijouxName  = name;
    tile.dataset.bijouxBase  = JSON.stringify(base);
    tile.dataset.bijouxPrice = price;
    const priceStr = price > 0
      ? `<span class="bijou-tile-price">${price.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>`
      : '';
    tile.innerHTML = `
      <div class="fabric-modal-tile-img">
        <img src="${image}" alt="${name}" loading="lazy">
        <div class="fabric-modal-tile-check">✓</div>
      </div>
      <div class="fabric-modal-tile-footer">
        <span class="fabric-modal-tile-num">${name}</span>
        ${priceStr}
      </div>
    `;
    tile.addEventListener('click', () => selectBijou(id, image, name, base, price));
    grid.appendChild(tile);
  });

  el.querySelector('.fabric-modal-backdrop').addEventListener('click', closeBijouModal);
  el.querySelector('.fabric-modal-close').addEventListener('click', closeBijouModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !bijouModalEl?.hidden) closeBijouModal();
  });

  return el;
}

function openBijouModal(triggerBtn, hiddenInput, infoEl) {
  if (!bijouModalEl) bijouModalEl = buildBijouModal();
  activeBijouContext = { triggerBtn, hiddenInput, infoEl };

  // Highlight current selection
  const currentId = hiddenInput.value;
  bijouModalEl.querySelectorAll('.fabric-modal-tile').forEach(tile => {
    tile.classList.toggle('is-selected', tile.dataset.bijouxId === currentId);
  });

  bijouModalEl.hidden = false;
  document.body.classList.add('fabric-modal-active');
  bijouModalEl.querySelector('.fabric-modal-close').focus();
}

function closeBijouModal() {
  if (!bijouModalEl) return;
  bijouModalEl.hidden = true;
  document.body.classList.remove('fabric-modal-active');
  activeBijouContext?.triggerBtn?.focus();
  activeBijouContext = null;
}

function selectBijou(bijouxId, image, name, base, price) {
  if (!activeBijouContext) return;
  const { triggerBtn, hiddenInput, infoEl } = activeBijouContext;
  const row = triggerBtn.closest('.bijou-item-row');

  // Store selection
  hiddenInput.value          = name; // human-readable name in email
  row.dataset.bijouxId       = bijouxId;
  row.dataset.bijouxPrice    = price;

  // Update trigger thumbnail
  triggerBtn.querySelector('.fabric-trigger-thumb').innerHTML =
    `<img src="${image}" alt="${name}" loading="lazy">`;
  triggerBtn.querySelector('.fabric-trigger-caption').textContent = name;
  triggerBtn.classList.add('has-selection');
  triggerBtn.classList.remove('is-missing');

  // Show the item name
  infoEl.querySelector('.bijou-item-name').textContent = name;

  // Show/hide base choice depending on whether multiple options exist
  const metalGroup  = infoEl.querySelector('.bijou-metal-group');
  const metalHidden = row.querySelector('input.bijou-metal-hidden');
  if (metalGroup && metalHidden) {
    const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
    if (base.length <= 1) {
      metalGroup.hidden = true;
      metalHidden.value = cap(base[0]);
    } else {
      const itemId = metalGroup.dataset.itemId;
      metalGroup.innerHTML = base.map(b => `
        <label class="radio-inline">
          <input type="radio" name="_metal_${itemId}" value="${b}">
          <span>${cap(b)}</span>
        </label>`).join('');
      metalGroup.querySelectorAll('input[type="radio"]').forEach(r => {
        r.addEventListener('change', () => { metalHidden.value = cap(r.value); });
      });
      metalGroup.hidden = false;
      metalHidden.value = '';
    }
  }

  updatePriceSummary();
  closeBijouModal();
}

// ── Bijoux item rows ──────────────────────────────────

function addBijouItem() {
  if (getTotalQty() >= MAX_TOTAL) return;

  bijouItemCounter++;
  const itemId    = bijouItemCounter;
  const container = document.getElementById('bijoux-items');

  const row = document.createElement('div');
  row.className = 'article-row bijou-item-row';
  row.dataset.bijouxId    = '';
  row.dataset.bijouxPrice = '0';

  // Hidden inputs submitted with the form
  const hiddenInput = document.createElement('input');
  hiddenInput.type  = 'hidden';
  hiddenInput.name  = `bijou_${itemId}`;
  hiddenInput.value = '';

  const metalHidden = document.createElement('input');
  metalHidden.type      = 'hidden';
  metalHidden.name      = `bijou_${itemId}_metal`;
  metalHidden.value     = '';
  metalHidden.className = 'bijou-metal-hidden';

  // Trigger button
  const triggerBtn = document.createElement('button');
  triggerBtn.type      = 'button';
  triggerBtn.className = 'fabric-trigger bijou-trigger';
  triggerBtn.setAttribute('aria-label', 'Choisir un bijou');
  triggerBtn.innerHTML = `
    <div class="fabric-trigger-thumb">
      <span class="fabric-trigger-placeholder" aria-hidden="true">+</span>
    </div>
    <span class="fabric-trigger-caption">Choisir</span>
  `;

  // Info area: name + metal/base choice (radios populated dynamically by selectBijou)
  const infoEl = document.createElement('div');
  infoEl.className = 'bijou-info';
  infoEl.innerHTML = `
    <span class="bijou-item-name article-name"></span>
    <div class="bijou-metal-group radio-inline-group" data-item-id="${itemId}" hidden></div>
  `;

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.type      = 'button';
  removeBtn.className = 'qty-btn remove-bijou-btn';
  removeBtn.setAttribute('aria-label', 'Supprimer ce bijou');
  removeBtn.textContent = '×';
  removeBtn.addEventListener('click', () => {
    row.remove();
    updateQtyControls();
    updatePriceSummary();
  });

  triggerBtn.addEventListener('click', () => openBijouModal(triggerBtn, hiddenInput, infoEl));

  const header = document.createElement('div');
  header.className = 'article-header';
  header.appendChild(triggerBtn);
  header.appendChild(infoEl);
  header.appendChild(removeBtn);

  row.appendChild(hiddenInput);
  row.appendChild(metalHidden);
  row.appendChild(header);
  container.appendChild(row);

  updateQtyControls();
  updatePriceSummary();
}

function updateAddBijouBtn() {
  const btn = document.getElementById('add-bijou-btn');
  if (btn) btn.disabled = getTotalQty() >= MAX_TOTAL;
}

// ── Live price summary ────────────────────────────────

function updatePriceSummary() {
  const summaryEl = document.getElementById('price-summary');
  const totalEl   = document.getElementById('price-total');
  if (!summaryEl || !totalEl) return;

  let total    = 0;
  let hasPrice = false;

  document.querySelectorAll('#articles-selector input[type="checkbox"]:checked').forEach(cb => {
    const price = parseFloat(cb.dataset.price) || 0;
    const qty   = parseInt(document.querySelector(`input[name="qty_${cb.dataset.id}"]`)?.value || 1, 10);
    if (price > 0) { total += price * qty; hasPrice = true; }
  });

  document.querySelectorAll('.bijou-item-row').forEach(row => {
    const price = parseFloat(row.dataset.bijouxPrice) || 0;
    if (price > 0) { total += price; hasPrice = true; }
  });

  const priceHidden = document.getElementById('price-hidden');
  if (hasPrice && total > 0) {
    const formatted = total.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €';
    summaryEl.hidden    = false;
    totalEl.textContent = formatted;
    if (priceHidden) priceHidden.value = formatted;
  } else {
    summaryEl.hidden = true;
    if (priceHidden) priceHidden.value = '—';
  }

  updateOrderCounter();
}

// ── Contact field validation (pure, exported for tests) ───────

export function validateContactFields({ prenom, nom, email }) {
  if (!prenom.trim()) return { field: 'prenom', message: 'Veuillez indiquer votre prénom.' };
  if (!nom.trim())    return { field: 'nom',    message: 'Veuillez indiquer votre nom.' };
  if (!email.trim())  return { field: 'email',  message: 'Veuillez indiquer votre adresse email.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return { field: 'email', message: 'Veuillez indiquer une adresse email valide.' };
  return null;
}

// ── Formspree submission ──────────────────────────────

function setupFormSubmit() {
  const form         = document.getElementById('order-form');
  const confirmation = document.getElementById('form-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const checkedArticles = document.querySelectorAll('#articles-selector input[type="checkbox"]:checked');
    const bijouxRows      = document.querySelectorAll('.bijou-item-row');

    if (checkedArticles.length === 0 && bijouxRows.length === 0) {
      alert('Veuillez sélectionner au moins un article ou ajouter un bijou.');
      return;
    }

    // Couture: every checked piece must have a fabric
    if (checkedArticles.length > 0) {
      let missingFabric = false;
      document.querySelectorAll('#articles-selector .article-row').forEach(row => {
        const cb = row.querySelector('input[type="checkbox"]');
        if (!cb?.checked) return;
        const qty       = parseInt(row.querySelector('.qty-input')?.value || 1, 10);
        const articleId = cb.dataset.id;
        for (let i = 1; i <= qty; i++) {
          const fabricInput = row.querySelector(`input[name="tissu_${articleId}_${i}"]`);
          if (!fabricInput?.value) {
            missingFabric = true;
            fabricInput?.closest('.fabric-pick')
              ?.querySelector('.fabric-trigger')
              ?.classList.add('is-missing');
          }
        }
      });
      if (missingFabric) {
        alert('Veuillez choisir un tissu pour chaque article sélectionné.');
        return;
      }
    }

    // Bijoux: every row must have a model and base chosen
    if (bijouxRows.length > 0) {
      let invalid = false;
      bijouxRows.forEach(row => {
        const hiddenInput = row.querySelector('input[name^="bijou_"]:not(.bijou-metal-hidden)');
        if (!hiddenInput?.value) {
          invalid = true;
          row.querySelector('.bijou-trigger')?.classList.add('is-missing');
        }
        const metalGroup  = row.querySelector('.bijou-metal-group');
        const metalHidden = row.querySelector('.bijou-metal-hidden');
        if (!metalGroup?.hidden && !metalHidden?.value) {
          invalid = true;
          metalGroup.classList.add('metal-missing');
        }
      });
      if (invalid) {
        alert('Veuillez compléter le choix de bijou et de base métal pour chaque article.');
        return;
      }
    }

    const contactError = validateContactFields({
      prenom: form.querySelector('#prenom')?.value ?? '',
      nom:    form.querySelector('#nom')?.value    ?? '',
      email:  form.querySelector('#email')?.value  ?? '',
    });
    if (contactError) {
      form.querySelector(`#${contactError.field}`)?.focus();
      alert(contactError.message);
      return;
    }

    const btn          = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled       = true;
    btn.textContent    = 'Envoi en cours…';

    // Set readable category label for Formspree email
    const catHidden = document.getElementById('cat-hidden');
    if (catHidden) {
      const hasCouture = checkedArticles.length > 0;
      const hasBijoux  = bijouxRows.length > 0;
      catHidden.value = hasCouture && hasBijoux ? 'Couture et bijoux' : hasCouture ? 'Couture' : 'Bijoux';
    }

    // Sync qty-hidden
    const qtyHiddenEl = document.getElementById('qty-hidden');
    if (qtyHiddenEl) {
      let qty = 0;
      document.querySelectorAll('#articles-selector .article-row').forEach(row => {
        const cb = row.querySelector('input[type="checkbox"]');
        if (cb?.checked) qty += parseInt(row.querySelector('.qty-input')?.value || 0, 10);
      });
      qty += bijouxRows.length;
      qtyHiddenEl.value = String(qty);
    }

    // Build FormData then strip:
    //   • qty_N for unchecked articles (irrelevant to this order)
    //   • _metal_N radios inside bijoux rows — raw values; bijou_N_metal carries the label
    const body = new FormData(form);
    document.querySelectorAll('#articles-selector .article-row').forEach(row => {
      const cb = row.querySelector('input[type="checkbox"]');
      if (!cb?.checked && cb?.dataset?.id) body.delete(`qty_${cb.dataset.id}`);
    });
    document.querySelectorAll('.bijou-item-row input[type="radio"][name]')
      .forEach(el => body.delete(el.name));

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        form.hidden         = true;
        confirmation.hidden = false;
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.errors?.map(e => e.message).join(', ') || 'Une erreur est survenue.');
        btn.disabled    = false;
        btn.textContent = originalText;
      }
    } catch {
      alert('Impossible d\'envoyer le formulaire. Vérifiez votre connexion et réessayez.');
      btn.disabled    = false;
      btn.textContent = originalText;
    }
  });
}

// ── Init ──────────────────────────────────────────────

async function init() {
  try {
    const [rawCouture, rawTissus, rawBijoux] = await Promise.all([
      fetchJSON('data/couture.json'),
      fetchJSON('data/tissus.json'),
      fetchJSON('data/bijoux.json'),
    ]);
    const coutureData = validateCouture(rawCouture);
    tissusData        = validateTissus(rawTissus);
    bijouxData        = validateBijoux(rawBijoux);

    renderArticlesSelector(coutureData);
    setupFormSubmit();

    document.getElementById('add-bijou-btn')
      ?.addEventListener('click', addBijouItem);

    // Initialise the hidden summary fields so they are never empty on submission
    updatePriceSummary();
  } catch (err) {
    console.error('Failed to initialise order form:', err);
  }
}

export const initPromise = init();
