import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'

export class StoredSpreadsList extends Komponent {
  constructor() {
    super()
    this._zapysy = []
  }

  vyvesty() {
    return `
      <section class="panel" style="display:none">
        <h2 id="list-title"></h2>
        <div id="history-list" class="history-list"></div>
      </section>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.namalyuvaty()
  }

  static get observedAttributes() { return ['title', 'items'] }
  attributeChangedCallback() { this.namalyuvaty() }

  set title(val) { this.setAttribute('title', val) }
  set items(val) { this._zapysy = val; this.namalyuvaty() }

  namalyuvaty() {
    const zapysy = this._zapysy || []
    const sektsiya = this.znayty('section')
    const tytul = this.znayty('list-title')
    const spysok = this.znayty('history-list')

    tytul.textContent = this.getAttribute('title') || ''

    if (!zapysy.length) {
      sektsiya.style.display = 'none'
      return
    }

    sektsiya.style.display = ''
    spysok.innerHTML = ''
    zapysy.forEach((zapis) => {
      const stattya = document.createElement('article')
      stattya.className = 'history-item'
      stattya.innerHTML = `
        <div class="history-head">
          <strong>${zapis.title}</strong>
          <span>${zapis.date}</span>
        </div>
        <div class="history-cards">
          ${zapis.cards.map((c) => `<span>${c}</span>`).join('')}
        </div>
      `
      spysok.appendChild(stattya)
    })
  }
}

vyznachyty('stored-spreads-list', StoredSpreadsList)
