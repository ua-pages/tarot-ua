import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { loadJournal, updateEntry } from '../services/journal-storage.js'
import { formatDate, groupItemsByMonth, pluralizeCards } from '../utils.js'
import { TONE_LABELS } from '../constants/interpretation.js'

export class JournalPage extends Komponent {
  constructor() {
    super()
    this._rozgornutoId = ''
    this._notatky = {}
  }

  vyvesty() {
    return `
      <main class="quiet-page">
        <app-nav></app-nav>

        <section class="quiet-room" aria-labelledby="journal-title">
          <p class="quiet-kicker">Особистий щоденник</p>
          <h1 id="journal-title">Історія розкладів</h1>
          <p class="quiet-lead quiet-lead-narrow">
            Усі ваші розклади зберігаються локально в браузері.
          </p>
        </section>

        <section class="quiet-note-panel">
          <div id="journal-content"></div>
          <div id="journal-empty" class="quiet-empty">
            <p>Ще немає записів. Зробіть розклад у тихій сесії — він з'явиться тут.</p>
            <div class="quiet-actions">
              <a class="quiet-btn quiet-btn-primary" href="/session">Перейти до сесії</a>
              <a class="quiet-btn quiet-btn-ghost" href="/">На головну</a>
            </div>
          </div>
        </section>
      </main>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.znaytyVsi('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault()
        window.navigateTo(a.getAttribute('href'))
      })
    })
    this.namalyuvaty()
  }

  namalyuvaty() {
    const zapysy = loadJournal()
    const vmist = this.znayty('journal-content')
    const pusto = this.znayty('journal-empty')

    if (!zapysy.length) {
      vmist.innerHTML = ''
      pusto.style.display = ''
      return
    }

    pusto.style.display = 'none'

    const grupy = groupItemsByMonth(zapysy)
    vmist.innerHTML = grupy.map((g) => `
      <section class="journal-month">
        <h3>${g.month}</h3>
        ${g.items.map((zapis) => this.namalyuvatyZapis(zapis)).join('')}
      </section>
    `).join('')

    vmist.querySelectorAll('.journal-summary').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id
        this._rozgornutoId = this._rozgornutoId === id ? '' : id
        this.namalyuvaty()
      })
    })

    vmist.querySelectorAll('.journal-note-textarea').forEach((ta) => {
      ta.addEventListener('input', (e) => {
        this._notatky[ta.dataset.id] = e.target.value
      })
    })

    vmist.querySelectorAll('.journal-save-note').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id
        const notatka = this._notatky[id] || ''
        updateEntry(id, { note: notatka })
        this._notatky[id] = notatka
        btn.textContent = 'Нотатку збережено'
        setTimeout(() => { btn.textContent = 'Зберегти нотатку' }, 2000)
      })
    })
  }

  namalyuvatyZapis(zapis) {
    const rozgornuto = this._rozgornutoId === zapis.id
    const tonLabel = zapis.interpretation?.tone && TONE_LABELS[zapis.interpretation.tone]
      ? TONE_LABELS[zapis.interpretation.tone]
      : 'Без тону'

    const kartyHtml = zapis.cards.map((karta) => `
      <article class="journal-drawn-card">
        <img src="${karta.card.image}" alt="${karta.card.name}" class="${karta.reversed ? 'is-reversed' : ''}" loading="lazy" decoding="async"
          onerror="this.src='/cards/tarot-placeholder.svg'">
        <div>
          <span class="journal-position">${karta.position}</span>
          <strong>${karta.card.name}</strong>
          ${karta.reversed ? '<small>Перевернута</small>' : ''}
          <p>${karta.positionDescription}</p>
        </div>
      </article>
    `).join('')

    const interpHtml = zapis.interpretation ? `
      <div class="journal-interpretation">
        <div class="journal-meta-row">
          <span>${zapis.interpretation.provider === 'llm' ? 'ШІ' : 'Запасний варіант'}</span>
          <span>${tonLabel}</span>
        </div>
        <h4>${zapis.interpretation.title}</h4>
        <p>${zapis.interpretation.summary}</p>
        <p><strong>Енергія:</strong> ${zapis.interpretation.energy}</p>
        <p><strong>Тінь:</strong> ${zapis.interpretation.shadow}</p>
        <p><strong>Наступний крок:</strong> ${zapis.interpretation.nextStep}</p>
      </div>
    ` : ''

    const notatka = this._notatky[zapis.id] ?? zapis.note ?? ''

    return `
      <article class="journal-card${rozgornuto ? ' expanded' : ''}">
        <button class="journal-summary" type="button" data-id="${zapis.id}">
          <span class="journal-icon">${zapis.favorite ? '★' : '✦'}</span>
          <span class="journal-main">
            <strong>${zapis.title}</strong>
            <small>${formatDate(zapis.createdAt)} · ${zapis.cards.length} ${pluralizeCards(zapis.cards.length)} · ${tonLabel}</small>
          </span>
          <span class="journal-chevron">${rozgornuto ? '−' : '+'}</span>
        </button>
        ${rozgornuto ? `
          <div class="journal-details">
            <div class="journal-card-grid">${kartyHtml}</div>
            ${interpHtml}
            <label class="journal-note">
              <span>Особиста нотатка</span>
              <textarea class="journal-note-textarea" data-id="${zapis.id}" placeholder="Що відчувається після цього розкладу? Що справдилось пізніше?" rows="4">${notatka}</textarea>
            </label>
            <div class="journal-actions">
              <button class="btn btn-secondary" type="button" onclick="window.navigateTo('/session')">Відкрити розклад</button>
              <button class="btn btn-ghost journal-save-note" data-id="${zapis.id}">Зберегти нотатку</button>
            </div>
          </div>
        ` : ''}
      </article>
    `
  }
}

vyznachyty('journal-page', JournalPage)
