// catalogue.js — Rendu des grilles produits et galerie tissus

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erreur lors du chargement : ${url}`);
  return res.json();
}

// ── Cartes produits ──────────────────────────────────────

function createProductCard({ name, price, description, image }) {
  const article = document.createElement('article');
  article.className = 'product-card';
  article.innerHTML = `
    <div class="product-img-wrap">
      <img src="${image}" alt="${name}" loading="lazy">
    </div>
    <div class="product-info">
      <h3>${name}</h3>
      <p>${description}</p>
      <span class="price">à partir de ${price}&nbsp;€</span>
    </div>
  `;
  return article;
}

function createBijouxCard({ name, price, base, image }) {
  const baseLabel = base.map(b => b === 'or' ? 'Or' : 'Argent').join(' / ');
  const article = document.createElement('article');
  article.className = 'product-card';
  article.innerHTML = `
    <div class="product-img-wrap">
      <img src="${image}" alt="${name}" loading="lazy">
    </div>
    <div class="product-info">
      <h3>${name}</h3>
      <span class="badge badge-metal">${baseLabel}</span>
      <span class="price">à partir de ${price}&nbsp;€</span>
    </div>
  `;
  return article;
}

// ── Galerie tissus ────────────────────────────────────────

const DISPO_LABELS = {
  disponible: 'Disponible',
  limité:     'Quantité limitée',
  épuisé:     'Épuisé',
};

function createTissuTile({ id, image, disponibilite }) {
  const div = document.createElement('div');
  div.className = `tissu-tile tissu-${disponibilite}`;

  const epuise = disponibilite === 'épuisé';

  div.innerHTML = `
    <div class="tissu-img-wrap">
      <img src="${image}" alt="Tissu n°${id}" loading="lazy">
      <span class="tissu-num">${id}</span>
    </div>
    <div class="tissu-footer">
      <span class="badge badge-${disponibilite}">${DISPO_LABELS[disponibilite]}</span>
    </div>
  `;

  if (!epuise) {
    div.addEventListener('click', () => openLightbox(image, `Tissu n°${id}`));
  }

  return div;
}

// ── Lightbox ──────────────────────────────────────────────

let lightboxEl = null;

function buildLightbox() {
  const el = document.createElement('div');
  el.className = 'lightbox';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Vue agrandie du tissu');
  el.innerHTML = `
    <div class="lightbox-backdrop"></div>
    <div class="lightbox-content">
      <button class="lightbox-close" aria-label="Fermer">&times;</button>
      <img class="lightbox-img" src="" alt="">
    </div>
  `;
  document.body.appendChild(el);

  el.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
  el.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });

  return el;
}

function openLightbox(src, alt) {
  if (!lightboxEl) lightboxEl = buildLightbox();
  lightboxEl.querySelector('.lightbox-img').src = src;
  lightboxEl.querySelector('.lightbox-img').alt = alt;
  lightboxEl.classList.add('open');
  document.body.classList.add('lightbox-active');
  lightboxEl.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
  lightboxEl?.classList.remove('open');
  document.body.classList.remove('lightbox-active');
}

// ── Initialisations par page ──────────────────────────────

async function initCouturePage() {
  try {
    const [coutureData, tissusData] = await Promise.all([
      fetchJSON('data/couture.json'),
      fetchJSON('data/tissus.json'),
    ]);

    const coutureGrid = document.getElementById('couture-grid');
    if (coutureGrid) {
      coutureData.forEach(item => coutureGrid.appendChild(createProductCard(item)));
    }

    const tissusGrid = document.getElementById('tissus-grid');
    if (tissusGrid) {
      tissusData.forEach(tissu => tissusGrid.appendChild(createTissuTile(tissu)));
    }
  } catch (err) {
    console.error('Erreur chargement page couture :', err);
  }
}

async function initBijouxPage() {
  try {
    const bijouxData = await fetchJSON('data/bijoux.json');
    const grid = document.getElementById('bijoux-grid');
    if (grid) {
      bijouxData.forEach(item => grid.appendChild(createBijouxCard(item)));
    }
  } catch (err) {
    console.error('Erreur chargement page bijoux :', err);
  }
}

// ── Démarrage ─────────────────────────────────────────────

const currentPage = location.pathname.split('/').pop() || 'index.html';
if (currentPage === 'couture.html') initCouturePage();
if (currentPage === 'bijoux.html')  initBijouxPage();
