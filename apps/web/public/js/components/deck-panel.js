import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'

export class DeckPanel extends Komponent {
  constructor() {
    super()
    this._karty = []
    this._pokazatyKolodu = false
    this._zavantazhennya = false
  }

  vyvesty() {
    return `
      <section class="panel deck-panel">
        <div class="section-head">
          <div>
            <h2 id="deck-title">Колода (78 карт)</h2>
            <p class="muted">Завантажується тільки за потреби, щоб перший екран був швидшим.</p>
          </div>
          <button id="toggle-btn" class="btn btn-ghost" type="button">Показати колоду</button>
        </div>
        <ul id="deck-list" class="deck-list" style="display:none"></ul>
      </section>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.znayty('toggle-btn').addEventListener('click', () => this.vyslaty('toggle'))
  }

  set cards(val) {
    this._karty = val
    this.znayty('deck-title').textContent = `Колода (${val.length} карт)`
    if (this._pokazatyKolodu) this.namalyuvatyKolodu()
  }

  set showDeck(val) {
    this._pokazatyKolodu = val
    const spysok = this.znayty('deck-list')
    const btn = this.znayty('toggle-btn')
    spysok.style.display = val ? '' : 'none'
    btn.textContent = val ? 'Сховати колоду' : this._zavantazhennya ? 'Завантажую...' : 'Показати колоду'
    if (val && this._karty.length) this.namalyuvatyKolodu()
  }

  set loading(val) {
    this._zavantazhennya = val
    const btn = this.znayty('toggle-btn')
    if (!this._pokazatyKolodu) btn.textContent = val ? 'Завантажую...' : 'Показати колоду'
    btn.disabled = val
  }

  namalyuvatyKolodu() {
    const spysok = this.znayty('deck-list')
    spysok.innerHTML = ''
    this._karty.forEach((karta) => {
      const li = document.createElement('li')
      const img = document.createElement('img')
      img.className = 'deck-thumb'
      img.src = karta.image
      img.alt = karta.name
      img.loading = 'lazy'
      img.decoding = 'async'
      img.addEventListener('error', (e) => this.vyslaty('image-error', e))

      const div = document.createElement('div')
      const strong = document.createElement('strong')
      strong.textContent = karta.name
      const span = document.createElement('span')
      span.textContent = karta.keywords.join(', ')
      div.appendChild(strong)
      div.appendChild(span)

      li.appendChild(img)
      li.appendChild(div)
      spysok.appendChild(li)
    })
  }
}

vyznachyty('deck-panel', DeckPanel)
