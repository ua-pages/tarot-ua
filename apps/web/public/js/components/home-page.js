const template = document.createElement('template');
template.innerHTML = `
  <main class="quiet-page quiet-home">
    <app-nav></app-nav>

    <section class="quiet-hero" aria-labelledby="home-title">
      <p class="quiet-kicker">Простір для тихих роздумів</p>
      <h1 id="home-title">Що зараз у вас всередині?</h1>
      <p class="quiet-lead">
        Іноді достатньо зупинитись на кілька хвилин, щоб краще почути себе.
        Карти, нотатки та м'які ШІ-рефлексії допоможуть сповільнитись і подивитись на свій стан уважніше.
      </p>

      <form class="quiet-nickname-form" id="nickname-form">
        <label for="nickname-input" class="quiet-nickname-label">Як до вас звертатись?</label>
        <div class="quiet-nickname-row">
          <input type="text" id="nickname-input" class="quiet-nickname-input"
            placeholder="Нікнейм" maxlength="30" autocomplete="off" required>
          <button type="submit" class="quiet-btn quiet-btn-primary">Почати сесію</button>
        </div>
      </form>

      <card-of-day-panel id="card-of-day" style="display:none; margin-top:2rem"></card-of-day-panel>

      <div class="quiet-actions">
        <a class="quiet-btn quiet-btn-primary" href="/session">Повільна сесія</a>
        <a class="quiet-btn quiet-btn-ghost" href="/fast-session">Швидка сесія</a>
        <a class="quiet-btn quiet-btn-ghost" href="/journal">Відкрити щоденник</a>
      </div>
    </section>

    <section class="quiet-intro-grid" aria-label="Що тут можна зробити">
      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">☾</span>
        <h2>Сповільнитись</h2>
        <p>Зробити невелику паузу, сформулювати думку і повернути увагу до себе.</p>
      </article>

      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">✧</span>
        <h2>Подивитись уважніше</h2>
        <p>Карти працюють як символи: не дають готових відповідей, а допомагають побачити внутрішній стан.</p>
      </article>

      <article class="quiet-card">
        <span class="quiet-card-icon" aria-hidden="true">✍</span>
        <h2>Зберегти думки</h2>
        <p>Кожна сесія може стати записом у щоденнику, до якого можна повернутись пізніше.</p>
      </article>
    </section>
  </main>
`;

import { adoptStyle } from '../shared-styles.js';
import { saveNickname, loadNickname } from '../services/session-storage.js';
import { fetchCardOfDay } from '../services/api.js';
import { getTodayTag } from '../utils.js';

export class HomePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  async connectedCallback() {
    await adoptStyle(this);
    this.shadowRoot.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        window.navigateTo(a.getAttribute('href'));
      });
    });

    const form = this.shadowRoot.getElementById('nickname-form');
    const existingName = loadNickname();
    if (existingName) {
      form.style.display = 'none';
      this.showCardOfDay();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.shadowRoot.getElementById('nickname-input');
      const name = input.value.trim();
      if (!name) return;
      saveNickname(name);
      form.style.display = 'none';
      this.showCardOfDay();
    });
  }

  async showCardOfDay() {
    const panel = this.shadowRoot.getElementById('card-of-day');
    try {
      const card = await fetchCardOfDay();
      panel.card = card;
      panel.todayLabel = getTodayTag();
      panel.style.display = '';
    } catch {
      panel.style.display = 'none';
    }
  }
}

customElements.define('home-page', HomePage);
