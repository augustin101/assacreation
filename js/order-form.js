// order-form.js — Formulaire de commande dynamique

// ── Chargement des données ────────────────────────────────

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur chargement : ${url}`);
  return res.json();
}

// ── Couleurs disponibles pour les bijoux ──────────────────

const COULEURS = [
  { value: 'beige-dore',   label: 'Beige doré',  hex: '#D4B896' },
  { value: 'terracotta',   label: 'Terracotta',  hex: '#B5623D' },
  { value: 'vert-foret',   label: 'Vert forêt',  hex: '#3D7A5C' },
  { value: 'bleu-nuit',    label: 'Bleu nuit',   hex: '#3A5A8A' },
  { value: 'bordeaux',     label: 'Bordeaux',    hex: '#7A2040' },
  { value: 'noir',         label: 'Noir',        hex: '#1A1A1A' },
  { value: 'blanc-creme',  label: 'Blanc crème', hex: '#F0E9DC' },
  { value: 'rose',         label: 'Rose',        hex: '#D4809C' },
  { value: 'jaune-dore',   label: 'Jaune doré',  hex: '#D4A020' },
];

// ── Construction du formulaire ────────────────────────────

function populateArticleSelect(couture) {
  const select = document.getElementById('article');
  if (!select) return;
  couture.forEach(({ id, name }) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = name;
    select.appendChild(opt);
  });
  const autre = document.createElement('option');
  autre.value = 'autre';
  autre.textContent = 'Autre (préciser dans les remarques)';
  select.appendChild(autre);
}

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
}

function renderTissusSelector(tissus, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

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
      <input type="checkbox" name="${containerId}" value="${id}" ${epuise ? 'disabled' : ''}>
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

// ── Toggle couture / bijoux ───────────────────────────────

function setupCategoryToggle() {
  const radios = document.querySelectorAll('input[name="categorie"]');
  const sectionCouture = document.getElementById('section-couture');
  const sectionBijoux  = document.getElementById('section-bijoux');

  if (!sectionCouture || !sectionBijoux) return;

  function applyRequired(section, enable) {
    section.querySelectorAll('[data-required]').forEach(el => {
      el.required = enable;
    });
  }

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.value === 'couture') {
        sectionCouture.hidden = false;
        sectionBijoux.hidden  = true;
        applyRequired(sectionCouture, true);
        applyRequired(sectionBijoux,  false);
      } else {
        sectionCouture.hidden = true;
        sectionBijoux.hidden  = false;
        applyRequired(sectionCouture, false);
        applyRequired(sectionBijoux,  true);
      }
    });
  });
}

// ── Soumission Formspree ──────────────────────────────────

function setupFormSubmit() {
  const form = document.getElementById('order-form');
  const confirmation = document.getElementById('form-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        form.hidden = true;
        confirmation.hidden = false;
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.errors?.map(e => e.message).join(', ')
          || 'Une erreur est survenue. Merci de réessayer.';
        alert(msg);
        btn.disabled = false;
        btn.textContent = originalText;
      }
    } catch {
      alert('Impossible d\'envoyer le formulaire. Vérifiez votre connexion et réessayez.');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
}

// ── Nav active (partagé avec les autres pages) ────────────

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelector(`.site-nav a[href="${page}"]`)?.classList.add('active');
}

// ── Initialisation ────────────────────────────────────────

async function init() {
  setActiveNav();

  try {
    const [coutureData, tissusData, bijouxData] = await Promise.all([
      fetchJSON('data/couture.json'),
      fetchJSON('data/tissus.json'),
      fetchJSON('data/bijoux.json'),
    ]);

    populateArticleSelect(coutureData);
    populateBijouxSelect(bijouxData);
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
