import { initAnalytics, trackEvent } from '../analytics/analytics.js';
import { updateFeatureFlags } from '../analytics/use-features.js';
import { adoptStyle } from '../shared-styles.js';

import './app-nav.js';
import './auth-panel.js';
import './card-of-day-panel.js';
import './deck-panel.js';
import './fast-session.js';
import './home-page.js';
import './interpretation-panel.js';
import './journal-page.js';
import './library-page.js';
import './ritual-selector.js';
import './seo-card-page.js';
import './seo-spread-page.js';
import './share-panel.js';
import './spread-board.js';
import './stored-spreads-list.js';
import './tarot-board.js';
import './tarot-journal.js';

const template = document.createElement('template');
template.innerHTML = `<div id="outlet"></div><footer class="made-in-ua">✦ Вироблено в Україні ✦</footer>`;

export class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._currentPage = null;
    this._currentRoute = null;
  }

  async connectedCallback() {
    await adoptStyle(this);
    window.navigateTo = (path) => {
      const base = '/tarot-ua';
      const clean = path.startsWith(base) ? path.slice(base.length) : path;
      const full = base + (clean.startsWith('/') ? clean : '/' + clean);
      window.history.pushState({}, '', full);
      this.route();
    };

    window.addEventListener('popstate', () => this.route());

    void initAnalytics();
    void updateFeatureFlags();
    this.addCursorGlow();

    this.route();
  }

  addCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'mystic-cursor-glow';
    glow.style.display = 'none';
    document.body.appendChild(glow);

    let timer;
    document.addEventListener('mousemove', (e) => {
      glow.style.display = '';
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
      clearTimeout(timer);
      timer = setTimeout(() => { glow.style.display = 'none'; }, 3000);
    });
  }

  route() {
    const base = '/tarot-ua';
    const path = window.location.pathname.replace(base, '') || '/';
    let route;

    const meaningMatch = path.match(/^\/meaning\/([A-Za-z0-9_-]+)\/?$/);
    if (meaningMatch?.[1]) {
      route = { kind: 'meaning', slug: meaningMatch[1] };
    }

    const spreadMatch = path.match(/^\/spreads\/([A-Za-z0-9_-]+)\/?$/);
    if (spreadMatch?.[1]) {
      route = { kind: 'spread', slug: spreadMatch[1] };
    }

    if (path === '/session' || path === '/session/') route = { kind: 'session', slug: '' };
    if (path === '/fast-session' || path === '/fast-session/') route = { kind: 'fast-session', slug: '' };
    if (path === '/journal' || path === '/journal/') route = { kind: 'journal', slug: '' };
    if (path === '/library' || path === '/library/') route = { kind: 'library', slug: '' };
    if (path === '/' || path === '') route = { kind: 'home', slug: '' };

    if (path.match(/^\/share\/([A-Za-z0-9_-]+)/)) {
      route = { kind: 'session', slug: '' };
    }

    if (!route) route = { kind: 'home', slug: '' };

    if (this._currentRoute?.kind === route.kind && this._currentRoute?.slug === route.slug) return;
    this._currentRoute = route;

    this.renderPage(route);
  }

  renderPage(route) {
    const outlet = this.shadowRoot.getElementById('outlet');
    outlet.innerHTML = '';

    let element;
    switch (route.kind) {
      case 'meaning':
        element = document.createElement('seo-card-page');
        element.setAttribute('slug', route.slug);
        break;
      case 'spread':
        element = document.createElement('seo-spread-page');
        element.setAttribute('slug', route.slug);
        break;
      case 'session':
        element = document.createElement('tarot-board');
        break;
      case 'fast-session':
        element = document.createElement('fast-session');
        break;
      case 'journal':
        element = document.createElement('journal-page');
        break;
      case 'library':
        element = document.createElement('library-page');
        break;
      default:
        element = document.createElement('home-page');
    }

    outlet.appendChild(element);
  }
}

customElements.define('app-root', AppRoot);
