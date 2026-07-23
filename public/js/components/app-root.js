import { adoptStyle } from '../shared-styles.js';

import './card-of-day-panel.js';
import './home-page.js';

const template = document.createElement('template');
template.innerHTML = `
  <home-page></home-page>
  <footer class="made-in-ua">✦ Створено в Україні · працює локально ✦</footer>
`;

export class AppRoot extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    await adoptStyle(this);
  }
}

customElements.define('app-root', AppRoot);
