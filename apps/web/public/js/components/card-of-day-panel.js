import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { cardMeaning } from '../utils.js'

export class CardOfDayPanel extends Komponent {
  constructor() {
    super()
    this._karta = null
    this._pomylka = ''
  }

  vyvesty() {
    return `
      <section class="panel">
        <h2>Карта дня</h2>
        <p id="today-label" class="muted"></p>
        <p id="error-msg" class="error" style="display:none"></p>
        <article id="card-day" class="card-day" style="display:none">
          <img id="card-image" class="card-image" src="" alt="" loading="lazy" decoding="async" />
          <div>
            <p id="position" class="position"></p>
            <h3 id="card-name"></h3>
            <p id="position-hint" class="position-hint"></p>
            <p id="keywords" class="keywords"></p>
            <p id="meaning"></p>
          </div>
        </article>
      </section>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.znayty('card-image').addEventListener('error', (e) => {
      this.vyslaty('image-error', e)
    })
  }

  set card(val) {
    this._karta = val
    this.namalyuvaty()
  }

  set todayLabel(val) {
    this.znayty('today-label').textContent = val
  }

  set error(val) {
    this._pomylka = val
    const pomylkaEl = this.znayty('error-msg')
    if (val) {
      pomylkaEl.textContent = val
      pomylkaEl.style.display = ''
    } else {
      pomylkaEl.style.display = 'none'
    }
  }

  namalyuvaty() {
    const kartaDnya = this.znayty('card-day')
    if (!this._karta) {
      kartaDnya.style.display = 'none'
      return
    }
    kartaDnya.style.display = 'grid'

    const img = this.znayty('card-image')
    img.src = this._karta.card.image
    img.alt = this._karta.card.name
    img.className = 'card-image' + (this._karta.reversed ? ' is-reversed' : '')

    this.znayty('position').textContent = this._karta.position
    this.znayty('card-name').innerHTML = `${this._karta.card.name}${this._karta.reversed ? ' <span>(перевернута)</span>' : ''}`
    this.znayty('position-hint').textContent = this._karta.positionDescription
    this.znayty('keywords').textContent = this._karta.card.keywords.join(' · ')
    this.znayty('meaning').textContent = cardMeaning(this._karta)
  }
}

vyznachyty('card-of-day-panel', CardOfDayPanel)
