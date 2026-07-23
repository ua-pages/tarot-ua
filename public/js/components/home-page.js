const template = document.createElement('template');
template.innerHTML = `
  <main class="quiet-page quiet-home">
    <section class="quiet-hero" aria-labelledby="home-title">
      <p class="quiet-kicker">Карта дня · локальна рефлексія</p>
      <h1 id="home-title">Зупиніться на одну мить.</h1>
      <p class="quiet-lead">
        Одна карта, одне запитання й ваша особиста нотатка.
        Це не передбачення — лише спосіб уважніше подивитися на свій стан.
      </p>
      <card-of-day-panel id="card-of-day" class="daily-card"></card-of-day-panel>
    </section>
  </main>
`;

import { adoptStyle } from '../shared-styles.js';
import { getCardOfDay } from '../services/tarot-engine.js';
import { getTodayTag } from '../utils.js';

export class HomePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    await adoptStyle(this);
    await this.showCardOfDay();
  }

  async showCardOfDay() {
    const panel = this.shadowRoot.getElementById('card-of-day');
    try {
      const card = getCardOfDay();
      panel.card = card;
      panel.todayLabel = getTodayTag();
    } catch {
      panel.error = 'Не вдалося відкрити карту дня. Оновіть сторінку й спробуйте ще раз.';
    }
  }
}

customElements.define('home-page', HomePage);
