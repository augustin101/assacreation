// components.js — Shared UI: header/footer injection, active nav, copyright year

const HEADER_HTML = `
  <div class="container">
    <a href="index.html" class="logo">Assa Créations</a>
    <button class="nav-toggle" aria-label="Ouvrir le menu"
            onclick="document.getElementById('site-header').classList.toggle('nav-open')">
      <span></span><span></span><span></span>
    </button>
    <nav class="site-nav" aria-label="Navigation principale">
      <a href="index.html">Accueil</a>
      <a href="couture.html">Couture</a>
      <a href="bijoux.html">Bijoux</a>
      <a href="commander.html" class="nav-cta">Commander</a>
      <a href="a-propos.html">À propos</a>
    </nav>
  </div>
`;

const FOOTER_HTML = `
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="index.html" class="footer-logo-link">
          <img src="images/welcome/logo.avif" alt="Assa Créations" class="footer-logo-img">
        </a>
        <p>Créations textiles &amp; bijoux faits main, avec amour.</p>
      </div>
      <nav class="footer-nav" aria-label="Navigation pied de page">
        <h3>Pages</h3>
        <a href="couture.html">Couture</a>
        <a href="bijoux.html">Bijoux</a>
        <a href="commander.html">Commander</a>
        <a href="a-propos.html">À propos</a>
      </nav>
      <div class="footer-contact">
        <h3>Contact</h3>
        <a href="mailto:contact@assacreation.com">contact@assacreation.com</a>
      </div>
    </div>
    <p class="footer-copy">&copy; <span id="year"></span> Assa Créations</p>
  </div>
`;

function injectHeader() {
  const header = document.getElementById('site-header');
  if (header) header.innerHTML = HEADER_HTML;
}

function injectFooter() {
  const footer = document.getElementById('site-footer');
  if (footer) footer.innerHTML = FOOTER_HTML;
}

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelector(`.site-nav a[href="${page}"]`)?.classList.add('active');
}

function setCopyrightYear() {
  const el = document.getElementById('year');
  if (el) el.textContent = new Date().getFullYear();
}

injectHeader();
injectFooter();
setActiveNav();
setCopyrightYear();
