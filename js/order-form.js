// order-form.js — Formulaire de commande dynamique

let bijouxData = [];

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur chargement : ${url}`);
  return res.json();
}

// ── Couleurs bijoux ───────────────────────────────────────

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

// ── Articles couture (checkboxes + quantités) ─────────────

function renderArticlesSelector(couture) {
  const container = document.getElementById('articles-selector');
  if (!container) return;

  couture.forEach(({ id, name, price }) => {
    const row = document.createElement('div');
    row.className = 'article-row';
    row.innerHTML = `
      <label class="article-check">
        <input type="checkbox" name="articles" value="${id}" data-price="${price}" data-name="${name}">
        <span class="article-name">${name}</span>
        ${price > 0 ? `<span class="article-price">${price.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €</span>` : ''}
      </label>
      <div class="article-qty" hidden>
        <button type="button" class="qty-btn qty-minus" aria-label="Diminuer la quantité">−</button>
        <input type="number" name="qty_${id}" value="1" min="1" max="10" class="qty-input" aria-label="Quantité">
        <button type="button" class="qty-btn qty-plus" aria-label="Augmenter la quantité">+</button>
      </div>
    `;

    const cb      = row.querySelector('input[type="checkbox"]');
    const qtyDiv  = row.querySelector('.article-qty');
    const qtyIn   = row.querySelector('.qty-input');
    const minusBtn = row.querySelector('.qty-minus');
    const plusBtn  = row.querySelector('.qty-plus');

    cb.addEventListener('change', () => {
      qtyDiv.hidden = !cb.checked;
      updatePriceSummary();
    });
    qtyIn.addEventListener('input', updatePriceSummary);
    minusBtn.addEventListener('click', () => {
      if (+qtyIn.value > 1) { qtyIn.value = +qtyIn.value - 1; updatePriceSummary(); }
    });
    plusBtn.addEventListener('click', () => {
      if (+qtyIn.value < 10) { qtyIn.value = +qtyIn.value + 1; updatePriceSummary(); }
    });

    container.appendChild(row);
  });
}

// ── Sélecteur de tissus (radio — un seul tissu) ───────────

function renderTissusSelector(tissus, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Nom du groupe radio = id du container pour isolation
  const radioName = containerId;

  tissus.forEach(({ id, image, disponibilite }) => {
    const epuise = disponibilite === 'épuisé';
    const label = document.createElement('label');
    label.className = `tissu-select-label${epuise ? ' is-epuise' : ''}`;

    const badgeHtml = disponibilite !== 'disponible'
      ? `<span class="badge badge-${disponibilite}" style="font-size:0.65rem;padding:1px 6px">
           ${disponibilite === 'limité' ? 'Limité' : 'Épuisé'}
         </span>`
      : '';

    label.innerHTML = `
      <input type="radio" name="${radioName}" value="${id}" ${epuise ? 'disabled' : ''}>
      <div class="tissu-select-inner">
        <div class="tissu-select-img">
          <img src="${image}" alt="Tissu n°${id}" loading="lazy">
          <div class="tissu-select-checkmark">✓</div>
        </div>
        <div class="tissu-select-footer">
          <span class="tissu-select-num">#${id}</span>
          ${badgeHtml}
        </div>
      </div>
    `;
    container.appendChild(label);
  });
}

// ── Pastilles couleurs bijoux ─────────────────────────────

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

// ── Dropdown modèles bijoux ───────────────────────────────

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

// ── Récapitulatif prix ────────────────────────────────────

function updatePriceSummary() {
  const summaryEl = document.getElementById('price-summary');
  const totalEl   = document.getElementById('price-total');
  if (!summaryEl || !totalEl) return;

  let total    = 0;
  let hasPrice = false;

  const categorie = document.querySelector('input[name="categorie"]:checked')?.value;

  if (categorie === 'couture') {
    document.querySelectorAll('#articles-selector input[type="checkbox"]:checked').forEach(cb => {
      const price = parseFloat(cb.dataset.price) || 0;
      const qty   = parseInt(document.querySelector(`input[name="qty_${cb.value}"]`)?.value || 1, 10);
      if (price > 0) { total += price * qty; hasPrice = true; }
    });
  } else if (categorie === 'bijoux') {
    const modelId = document.getElementById('modele-bijou')?.value;
    const item    = bijouxData.find(b => b.id === modelId);
    if (item?.price > 0) { total = item.price; hasPrice = true; }
  }

  if (hasPrice && total > 0) {
    summaryEl.hidden = false;
    totalEl.textContent = total.toLocaleString('fr-FR', { minimumFractionDigits: 0 }) + ' €';
  } else {
    summaryEl.hidden = true;
  }
}

// ── Toggle couture / bijoux ───────────────────────────────

function setupCategoryToggle() {
  const radios          = document.querySelectorAll('input[name="categorie"]');
  const sectionCouture  = document.getElementById('section-couture');
  const sectionBijoux   = document.getElementById('section-bijoux');
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

// ── Soumission Formspree ──────────────────────────────────

function setupFormSubmit() {
  const form         = document.getElementById('order-form');
  const confirmation = document.getElementById('form-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validation : au moins un article coché pour la couture
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
        const msg  = data?.errors?.map(e => e.message).join(', ') || 'Une erreur est survenue.';
        alert(msg);
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

// ── Nav active ────────────────────────────────────────────

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelector(`.site-nav a[href="${page}"]`)?.classList.add('active');
}

// ── Initialisation ────────────────────────────────────────

async function init() {
  setActiveNav();

  try {
    const [coutureData, tissusData, bijoux] = await Promise.all([
      fetchJSON('data/couture.json'),
      fetchJSON('data/tissus.json'),
      fetchJSON('data/bijoux.json'),
    ]);

    bijouxData = bijoux;

    renderArticlesSelector(coutureData);
    populateBijouxSelect(bijoux);
    renderTissusSelector(tissusData, 'tissus-selector');
    renderTissusSelector(tissusData, 'doublure-selector');
    renderColorChips();
    setupCategoryToggle();
    setupFormSubmit();
  } catch (err) {
    console.error('Erreur initialisation formulaire :', err);
  }
}

init();
