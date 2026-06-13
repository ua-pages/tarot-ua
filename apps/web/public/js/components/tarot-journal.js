import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { formatDate, groupItemsByMonth, pluralizeCards } from '../utils.js'
import { TONE_LABELS } from '../constants/interpretation.js'

export class TarotJournal extends Komponent {
  constructor() {
    super()
    this._zapysy = []
    this._rozgornutoId = ''
    this._notatky = {}
  }

  vyvesty() {
    return `
      <section id="journal-panel" class="panel journal-panel" style="display:none">
        <div class="section-head">
          <div>
            <p class="eyebrow">Щоденник Таро</p>
            <h2 id="journal-title"></h2>
            <p class="muted">Збережені розклади як особистий архів: карти, позиції, ШІ-тлумачення і твої нотатки.</p>
          </div>
          <span id="journal-count" class="journal-count"></span>
        </div>
        <div id="journal-timeline" class="journal-timeline"></div>
      </section>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.namalyuvaty()
  }

  set title(val) { this.setAttribute('title', val) }
  set items(val) { this._zapysy = val; this.namalyuvaty() }
  get title() { return this.getAttribute('title') || '' }

  namalyuvaty() {
    const sektsiya = this.znayty('journal-panel')
    const zapysy = this._zapysy

    if (!zapysy.length) {
      sektsiya.style.display = 'none'
      return
    }

    sektsiya.style.display = ''
    this.znayty('journal-title').textContent = this.title
    this.znayty('journal-count').textContent = `${zapysy.length} ${zapysy.length === 1 ? 'запис' : 'записів'}`

    const chasovaLiniya = this.znayty('journal-timeline')
    chasovaLiniya.innerHTML = ''

    const grupy = groupItemsByMonth(zapysy)
    grupy.forEach((grupa) => {
      const misSektsiya = document.createElement('section')
      misSektsiya.className = 'journal-month'
      const h3 = document.createElement('h3')
      h3.textContent = grupa.month
      misSektsiya.appendChild(h3)

      grupa.items.forEach((zapis) => {
        misSektsiya.appendChild(this.stvorytyKartkuZapysu(zapis))
      })

      chasovaLiniya.appendChild(misSektsiya)
    })
  }

  stvorytyKartkuZapysu(zapis) {
    const stattya = document.createElement('article')
    stattya.className = `journal-card${this._rozgornutoId === zapis.id ? ' expanded' : ''}`

    const sumary = document.createElement('button')
    sumary.className = 'journal-summary'
    sumary.type = 'button'
    sumary.innerHTML = `
      <span class="journal-icon">✦</span>
      <span class="journal-main">
        <strong>${zapis.title}</strong>
        <small>${formatDate(zapis.createdAt)} · ${zapis.cards.length} ${pluralizeCards(zapis.cards.length)} · ${this.znachokTonu(zapis.interpretation?.tone)}</small>
      </span>
      <span class="journal-chevron">${this._rozgornutoId === zapis.id ? '−' : '+'}</span>
    `
    sumary.addEventListener('click', () => {
      this._rozgornutoId = this._rozgornutoId === zapis.id ? '' : zapis.id
      this.namalyuvaty()
    })
    stattya.appendChild(sumary)

    if (this._rozgornutoId === zapis.id) {
      const detal = document.createElement('div')
      detal.className = 'journal-details'

      const sitkaKart = document.createElement('div')
      sitkaKart.className = 'journal-card-grid'
      zapis.cards.forEach((karta) => {
        const kartaStatt = document.createElement('article')
        kartaStatt.className = 'journal-drawn-card'
        const img = document.createElement('img')
        img.src = karta.card.image
        img.alt = karta.card.name
        img.className = karta.reversed ? 'is-reversed' : ''
        img.loading = 'lazy'
        img.decoding = 'async'
        img.addEventListener('error', (e) => this.vyslaty('image-error', e))
        const div = document.createElement('div')
        div.innerHTML = `
          <span class="journal-position">${karta.position}</span>
          <strong>${karta.card.name}</strong>
          ${karta.reversed ? '<small>Перевернута</small>' : ''}
          <p>${karta.positionDescription}</p>
        `
        kartaStatt.appendChild(img)
        kartaStatt.appendChild(div)
        sitkaKart.appendChild(kartaStatt)
      })
      detal.appendChild(sitkaKart)

      if (zapis.interpretation) {
        const interpDiv = document.createElement('div')
        interpDiv.className = 'journal-interpretation'
        interpDiv.innerHTML = `
          <div class="journal-meta-row">
            <span>${zapis.interpretation.provider === 'llm' ? 'ШІ' : 'Запасний варіант'}</span>
            <span>${this.znachokTonu(zapis.interpretation.tone)}</span>
          </div>
          <h4>${zapis.interpretation.title}</h4>
          <p>${zapis.interpretation.summary}</p>
          <p><strong>Енергія:</strong> ${zapis.interpretation.energy}</p>
          <p><strong>Тінь:</strong> ${zapis.interpretation.shadow}</p>
          <p><strong>Наступний крок:</strong> ${zapis.interpretation.nextStep}</p>
        `
        detal.appendChild(interpDiv)
      }

      const label = document.createElement('label')
      label.className = 'journal-note'
      label.innerHTML = '<span>Особиста нотатка</span>'
      const textarea = document.createElement('textarea')
      textarea.value = this._notatky[zapis.id] ?? zapis.note ?? ''
      textarea.placeholder = 'Що відчувається після цього розкладу? Що справдилось пізніше?'
      textarea.rows = 4
      textarea.addEventListener('input', (e) => {
        this._notatky[zapis.id] = e.target.value
      })
      label.appendChild(textarea)

      const diyi = document.createElement('div')
      diyi.className = 'journal-actions'
      const vidkrytyBtn = document.createElement('button')
      vidkrytyBtn.className = 'btn btn-secondary'
      vidkrytyBtn.type = 'button'
      vidkrytyBtn.textContent = 'Відкрити розклад'
      vidkrytyBtn.addEventListener('click', () => this.vyslaty('open', zapis))
      const zberegtyBtn = document.createElement('button')
      zberegtyBtn.className = 'btn btn-ghost'
      zberegtyBtn.type = 'button'
      zberegtyBtn.textContent = 'Зберегти нотатку'
      zberegtyBtn.addEventListener('click', () => {
        this.vyslaty('save-note', { id: zapis.id, note: this._notatky[zapis.id] ?? zapis.note ?? '' })
      })
      diyi.appendChild(vidkrytyBtn)
      diyi.appendChild(zberegtyBtn)

      detal.appendChild(label)
      detal.appendChild(diyi)
      stattya.appendChild(detal)
    }

    return stattya
  }

  znachokTonu(ton) {
    return ton && ton in TONE_LABELS ? TONE_LABELS[ton] : 'Без тону'
  }
}

vyznachyty('tarot-journal', TarotJournal)
