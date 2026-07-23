import { getCardMeaning } from '../utils.js';
import {
  getReflectionQuestion,
  loadReflection,
  saveReflection,
} from '../services/daily-reflection.js';

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

const template = document.createElement('template');
template.innerHTML = `
  <section class="panel">
    <h2>Карта дня</h2>
    <p id="today-label" class="muted"></p>
    <p id="error-msg" class="error" style="display:none"></p>
    <article id="card-day" class="card-day" style="display:none">
      <img id="card-image" class="card-image" src="" alt="" loading="lazy" decoding="async" />
      <div class="daily-card-copy">
        <p id="position" class="position"></p>
        <h3 id="card-name"></h3>
        <p id="position-hint" class="position-hint"></p>
        <p id="keywords" class="keywords"></p>
        <p id="meaning"></p>
        <div class="daily-reflection">
          <p class="daily-question" id="reflection-question"></p>
          <label for="reflection-note">Ваша нотатка</label>
          <textarea
            id="reflection-note"
            rows="4"
            maxlength="1200"
            placeholder="Запишіть те, що відгукнулося…"
          ></textarea>
          <div class="daily-reflection-actions">
            <button class="quiet-btn quiet-btn-primary" id="save-reflection" type="button">
              Зберегти локально
            </button>
            <span id="save-status" role="status"></span>
          </div>
        </div>
      </div>
    </article>
  </section>
`;

import { adoptStyle } from '../shared-styles.js';

export class CardOfDayPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this._card = null;
    this._error = '';
  }

  async connectedCallback() {
    await adoptStyle(this);
    const img = this.shadowRoot.getElementById('card-image');
    img.addEventListener('error', (e) => {
      this.dispatchEvent(new CustomEvent('image-error', { detail: e }));
    });
    this.shadowRoot.getElementById('save-reflection').addEventListener('click', () => {
      const note = this.shadowRoot.getElementById('reflection-note').value;
      const saved = saveReflection(getLocalStorage(), note);
      this.shadowRoot.getElementById('save-status').textContent = saved
        ? (note.trim() ? 'Збережено лише на цьому пристрої.' : 'Локальну нотатку видалено.')
        : 'Браузер не дозволив локальне збереження.';
    });
  }

  set card(val) {
    this._card = val;
    this.render();
  }

  set todayLabel(val) {
    this.shadowRoot.getElementById('today-label').textContent = val;
  }

  set error(val) {
    this._error = val;
    const errorEl = this.shadowRoot.getElementById('error-msg');
    if (val) {
      errorEl.textContent = val;
      errorEl.style.display = '';
    } else {
      errorEl.style.display = 'none';
    }
  }

  render() {
    const cardDay = this.shadowRoot.getElementById('card-day');
    if (!this._card) {
      cardDay.style.display = 'none';
      return;
    }
    cardDay.style.display = 'grid';

    const img = this.shadowRoot.getElementById('card-image');
    img.src = this._card.card.image;
    img.alt = this._card.card.name;
    img.className = 'card-image' + (this._card.reversed ? ' is-reversed' : '');

    this.shadowRoot.getElementById('position').textContent = this._card.position;
    this.shadowRoot.getElementById('card-name').innerHTML = `${this._card.card.name}${this._card.reversed ? ' <span>(перевернута)</span>' : ''}`;
    this.shadowRoot.getElementById('position-hint').textContent = this._card.positionDescription;
    this.shadowRoot.getElementById('keywords').textContent = this._card.card.keywords.join(' · ');
    this.shadowRoot.getElementById('meaning').textContent = getCardMeaning(this._card);
    this.shadowRoot.getElementById('reflection-question').textContent = getReflectionQuestion(this._card);
    this.shadowRoot.getElementById('reflection-note').value = loadReflection(getLocalStorage());
  }
}

customElements.define('card-of-day-panel', CardOfDayPanel);
