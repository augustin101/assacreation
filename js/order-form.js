// order-form.js — Dynamic order form (category toggle, article selector, fabric picker)

let tissusData = [];
let bijouxData = [];

const MAX_PER_ARTICLE = 5;
const MAX_TOTAL       = 10;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load: ${url}`);
  return res.json();
}

// ── Bead colour options ───────────────────────────────

const COULEURS = [
  { value: 'beige-dore',  label: 'Beige doré',  hex: '#D4B896' },
  { value: 'terracotta',  label: 'Terracotta',  hex: '#B5623D' },
  { value: 'vert-foret',  label: 'Vert forêt',  hex: '#3D7A5C' },
  { value: 'bleu-nuit',   label: 'Bleu nuit',   hex: '#3A5A8A' },
  { value: 'bordeaux',    label: 'Bordeaux',    hex: '#7A2040' },
  { value: 'noir',        label: 'Noir',        hex: '#1A1A1A' },
  { value: 'blanc-creme', label: 'Blanc crème', hex: '#F0E9DC' },
  { value: 'rose',        label: 'Rose',        hex: '#D4809C' },
  { value: 'jaune-dore',  label: 'Jaune doré',  hex: '#D4A020' },
];

// ── Quantity helpers ──────────────────────────────────

function getTotalQty() {
  let total = 0;
  document.querySelectorAll('#articles-selector .article-row').forEach(row => {
    const cb = row.querySelector('input[type="checkbox"]');
    if (cb?.checked) total += parseInt(row.querySelector('.qty-input')?.value || 0, 10);
  });
  return total;
}

// Disable +/- buttons that would exceed per-article (5) or global (10) limits
function updateQtyControls() {
  const total = getTotalQty();
  document.querySelectorAll('#articles-selector .article-row').forEach(row => {
    const cb      = row.querySelector('input[type="checkbox"]');
    const plusBtn = row.querySelector('.qty-plus');
    const minusBtn = row.querySelector('.qty-minus');
    const qtyIn   = row.querySelector('.qty-input');
    if (!plusBtn || !qtyIn) return;
    const qty = parseInt(qtyIn.value, 10);
    plusBtn.disabled  = !cb?.checked || total >= MAX_TOTAL || qty >= MAX_PER_ARTICLE;
    minusBtn.disabled = !cb?.checked || qty <= 1;
  });
}

// ── Per-piece fabric picker ───────────────────────────

// Builds a single mini fabric picker (2-column scrollable radio grid) for one piece
function buildFabricPick(articleId, pieceIndex) {
  const wrap = document.createElement('div');
  wrap.className = 'fabric-pick';

  const lbl = document.createElement('span');
  lbl.className = 'fabric-pick-label';
  lbl.textContent = `Pièce ${pieceIndex}`;
  wrap.appendChild(lbl);

  const scroll = document.createElement('div');
  scroll.className = 'fabric-pick-scroll';

  tissusData.forEach(({ id, image, disponibilite }) => {
    const epuise = disponibilite === 'épuisé';
    const tile = document.createElement('label');
    tile.className = `fabric-pick-tile${epuise ? ' is-epuise' : ''}`;
    tile.title = `Tissu n°${id}`;
    tile.innerHTML = `
      <input type="radio" name="tissu_${articleId}_${pieceIndex}" value="${id}" ${epuise ? 'disabled' : ''}>
      <div class="fabric-pick-tile-img">
        <img src="${image}" alt="Tissu ${id}" loading="lazy">
        <div class="fabric-pick-tile-check">✓</div>
      </div>
    `;
    scroll.appendChild(tile);
  });

  wrap.appendChild(scroll);
  return wrap;
}

// Rebuild the fabric picker strip under an article row for the given quantity
function rebuildFabricStrip(row, articleId, qty) {
  const existing = row.querySelector('.article-fabric-strip');
  if (existing) existing.remove();
  if (qty < 1) return;

  const strip = document.createElement('div');
  strip.className = 'article-fabric-strip';
  for (let i = 1; i <= qty; i++) {
    strip.appendChild(buildFabricPick(articleId, i));
  }
  row.appendChild(strip);
}

// ── Article checklist ─────────────────────────────────

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
        <input type="checkbox" name="articles" value="${id}" data-price="${price}" data-name="${name}">
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

    cb.addEventListener('change', () => {
      qtyDiv.hidden = !cb.checked;
      rebuildFabricStrip(row, id, cb.checked ? parseInt(qtyIn.value, 10) : 0);
      updateQtyControls();
      updatePriceSummary();
    });

    function changeQty(delta) {
      const current = parseInt(qtyIn.value, 10);
      const totalWithoutThis = getTotalQty() - current;
      const maxAllowed = Math.min(MAX_PER_ARTICLE, MAX_TOTAL - totalWithoutThis);
      const newQty = Math.max(1, Math.min(maxAllowed, current + delta));
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

// ── Bijoux model dropdown ─────────────────────────────

function populateBijouxSelect(bijoux) {
  const select = document.getElementById('modele-bijou');
  if (!select) return;
  bijoux.forEach(({ id, name }) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = name;
    select.appendChild(opt);
  });
  const libre = document.createElement('option');
  libre.value = 'libre';
  libre.textContent = 'Idée libre / thème (préciser dans la description)';
  select.appendChild(libre);

  select.addEventListener('change', updatePriceSummary);
}

// ── Colour chip checkboxes ────────────────────────────

function renderColorChips() {
  const container = document.getElementById('couleurs-chips');
  if (!container) return;
  COULEURS.forEach(({ value, label, hex }) => {
    const chipLabel = document.createElement('label');
    chipLabel.className = 'color-chip';
    chipLabel.innerHTML = `
      <input type="checkbox" name="couleurs" value="${value}">
      <span class="color-dot" style="background-color:${hex}"></span>
      ${label}
    `;
    container.appendChild(chipLabel);
  });
}

// ── Live price summary ────────────────────────────────

function updatePriceSummary() {
  const summaryEl = document.getElementById('price-summary');
  const totalEl   = document.getElementById('price-total');
  const countEl   = document.getElementById('price-count');
  if (!summaryEl || !totalEl) return;

  let total    = 0;
  let totalQty = 0;
  let hasPrice = false;

  const categorie = document.querySelector('input[name="categorie"]:checked')?.value;

  if (categorie === 'couture') {
    document.querySelectorAll('#articles-selector input[type="checkbox"]:checked').forEach(cb => {
      const price = parseFloat(cb.dataset.price) || 0;
      const qty   = parseInt(document.querySelector(`input[name="qty_${cb.value}"]`)?.value || 1, 10);
      totalQty += qty;
      if (price > 0) { total += price * qty; hasPrice = true; }
    });
    if (countEl) {
      const remaining = MAX_TOTAL - totalQty;
      countEl.textContent = totalQty > 0
        ? `${totalQty} article${totalQty > 1 ? 's' : ''} — ${remaining} restant${remaining > 1 ? 's' : ''} (max ${MAX_TOTAL})`
        : '';
    }
  } else if (categorie === 'bijoux') {
    const modelId = document.getElementById('modele-bijou')?.value;
    const item    = bijouxData.find(b => b.id === modelId);
    if (item?.price > 0) { total = item.price; hasPrice = true; }
    if (countEl) countEl.textContent = '';
  }

  if (hasPrice && total > 0) {
    summaryEl.hidden = false;
    totalEl.textContent = total.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €';
  } else {
    summaryEl.hidden = true;
  }
}

// ── Category toggle (couture / bijoux) ────────────────

function setupCategoryToggle() {
  const radios         = document.querySelectorAll('input[name="categorie"]');
  const sectionCouture = document.getElementById('section-couture');
  const sectionBijoux  = document.getElementById('section-bijoux');
  if (!sectionCouture || !sectionBijoux) return;

  function applyRequired(section, enable) {
    section.querySelectorAll('[data-required]').forEach(el => { el.required = enable; });
  }

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      const isCouture = radio.value === 'couture';
      sectionCouture.hidden = !isCouture;
      sectionBijoux.hidden  = isCouture;
      applyRequired(sectionCouture, isCouture);
      applyRequired(sectionBijoux, !isCouture);
      updatePriceSummary();
    });
  });
}

// ── Formspree submission ──────────────────────────────

function setupFormSubmit() {
  const form         = document.getElementById('order-form');
  const confirmation = document.getElementById('form-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Require at least one article checked for couture orders
    const categorie = document.querySelector('input[name="categorie"]:checked')?.value;
    if (categorie === 'couture') {
      const checked = document.querySelectorAll('#articles-selector input[type="checkbox"]:checked');
      if (checked.length === 0) {
        alert('Veuillez sélectionner au moins un article.');
        return;
      }
    }

    const btn          = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled       = true;
    btn.textContent    = 'Envoi en cours…';

    try {
      const res = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
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
    const [coutureData, tissus, bijoux] = await Promise.all([
      fetchJSON('data/couture.json'),
      fetchJSON('data/tissus.json'),
      fetchJSON('data/bijoux.json'),
    ]);
    tissusData = tissus;
    bijouxData = bijoux;

    renderArticlesSelector(coutureData);
    populateBijouxSelect(bijoux);
    renderColorChips();
    setupCategoryToggle();
    setupFormSubmit();
  } catch (err) {
    console.error('Failed to initialise order form:', err);
  }
}

init();
