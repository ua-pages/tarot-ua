import { adoptStyle } from '../shared-styles.js';
import './home-page.js';

function getBase() {
  const base = document.querySelector('base');
  return base ? base.getAttribute('href').replace(/\/+$/, '') : '';
}

function resolveRoute() {
  const base = getBase();
  let path = location.pathname;
  if (base && path.startsWith(base)) {
    path = path.slice(base.length) || '/';
  }
  const p = new URLSearchParams(location.search).get('p');
  if (p) path = '/' + decodeURIComponent(p).replace(/^\//, '');
  return path;
}

const routes = [
  { pattern: /^\/meaning\/(.+)$/, load: () => import('./seo-card-page.js'), tag: 'seo-card-page', attr: (m) => ({ slug: m[1] }) },
  { pattern: /^\/spreads\/(.+)$/, load: () => import('./seo-spread-page.js'), tag: 'seo-spread-page', attr: (m) => ({ slug: m[1] }) },
  { pattern: /^\/share\//, load: () => import('./tarot-board.js'), tag: 'tarot-board' },
  { pattern: /^\/session$/, load: () => import('./tarot-board.js'), tag: 'tarot-board' },
  { pattern: /^\/fast-session$/, load: () => import('./fast-session.js'), tag: 'fast-session' },
  { pattern: /^\/journal$/, load: () => import('./journal-page.js'), tag: 'journal-page' },
  { pattern: /^\/library$/, load: () => import('./library-page.js'), tag: 'library-page' },
  { pattern: /^\//, load: null, tag: 'home-page' },
];

function matchRoute(path) {
  for (const route of routes) {
    const m = path.match(route.pattern);
    if (m) return { route, m };
  }
  return { route: routes[routes.length - 1], m: null };
}

window.navigateTo = (href) => {
  const base = getBase();
  history.pushState(null, '', base + href);
  renderPage();
};

window.addEventListener('popstate', renderPage);

async function renderPage() {
  const path = resolveRoute();
  const { route, m } = matchRoute(path);
  const root = document.querySelector('app-root');
  if (!root || !root.shadowRoot) return;
  const shadow = root.shadowRoot;
  const slot = shadow.getElementById('page-slot');
  if (!slot) return;
  while (slot.firstChild) slot.removeChild(slot.firstChild);
  if (route.load) await route.load();
  const el = document.createElement(route.tag);
  const attrs = route.attr ? route.attr(m) : {};
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  slot.appendChild(el);
}

const template = document.createElement('template');
template.innerHTML = `<div id="page-slot"></div><footer class="made-in-ua">✦ Створено в Україні · працює локально ✦</footer>`;

export class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    await adoptStyle(this);
    renderPage();
  }
}

customElements.define('app-root', AppRoot);
