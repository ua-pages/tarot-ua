import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'

export class InterpretationPanel extends Komponent {
  constructor() {
    super()
    this._maeRozklad = false
    this._tlumachennya = null
    this._zavantazhennya = false
    this._ton = 'psychological'
    this._tony = []
  }

  vyvesty() {
    return `
      <section class="panel interpretation-panel" id="interp-section" style="display:none">
        <div class="section-head interpretation-head">
          <div>
            <p class="eyebrow">
              ШІ-тлумачення
              <span id="provider-pill" class="provider-pill" style="display:none"></span>
            </p>
            <h2>Цілісне прочитання розкладу</h2>
            <p class="muted">Не просто значення карт окремо — а зв'язки, напруга, порада й наступний крок.</p>
          </div>
          <div class="tone-switcher" id="tone-switcher" aria-label="Тон тлумачення"></div>
        </div>

        <div id="loading-state" class="interpretation-loading" style="display:none">
          <span class="spinner-orb" aria-hidden="true"></span>
          <p>Зчитую взаємодію карт...</p>
        </div>

        <article id="interp-card" class="interpretation-card" style="display:none">
          <div class="interpretation-summary">
            <h3 id="interp-title"></h3>
            <p id="interp-summary"></p>
          </div>
          <div class="interpretation-energy">
            <strong>Загальна енергія</strong>
            <p id="interp-energy"></p>
          </div>
          <div id="interactions-block" class="interpretation-block" style="display:none">
            <h3>Взаємодія карт</h3>
            <ul id="interactions-list"></ul>
          </div>
          <div class="interpretation-grid">
            <div class="interpretation-block">
              <h3>Порада</h3>
              <ul id="advice-list"></ul>
            </div>
            <div class="interpretation-block">
              <h3>Тінь</h3>
              <p id="shadow-text"></p>
            </div>
          </div>
          <div class="next-step">
            <strong>Наступний крок</strong>
            <p id="next-step-text"></p>
          </div>
        </article>

        <div id="refresh-state" class="interpretation-refresh" aria-live="polite" style="display:none">
          <span class="spinner-orb spinner-orb-small" aria-hidden="true"></span>
          <span>Оновлюю тон тлумачення...</span>
        </div>
      </section>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.onovlytyVydymist()
  }

  set hasSpread(val) {
    this._maeRozklad = val
    this.onovlytyVydymist()
  }

  set interpretation(val) {
    this._tlumachennya = val
    this.namalyuvaty()
  }

  set loading(val) {
    this._zavantazhennya = val
    this.namalyuvaty()
  }

  set tone(val) {
    this._ton = val
    this.namalyuvatyKnpkyTonu()
  }

  set tones(val) {
    this._tony = val
    this.namalyuvatyKnpkyTonu()
  }

  onovlytyVydymist() {
    this.znayty('interp-section').style.display = this._maeRozklad ? '' : 'none'
  }

  namalyuvaty() {
    this.namalyuvatyKnpkyTonu()
    this.namalyuvatyTlumachennya()
  }

  namalyuvatyKnpkyTonu() {
    const konteyner = this.znayty('tone-switcher')
    konteyner.innerHTML = ''
    this._tony.forEach((tonOption) => {
      const btn = document.createElement('button')
      btn.className = `tone-button${tonOption.value === this._ton ? ' active' : ''}`
      btn.type = 'button'
      btn.disabled = this._zavantazhennya
      btn.textContent = tonOption.label
      btn.addEventListener('click', () => this.vyslaty('set-tone', tonOption.value))
      konteyner.appendChild(btn)
    })
  }

  namalyuvatyTlumachennya() {
    const sektsiya = this.znayty('interp-section')
    sektsiya.className = `panel interpretation-panel${this._zavantazhennya ? ' is-loading' : ''}`

    const zavantazhennya = this.znayty('loading-state')
    const kartaTlum = this.znayty('interp-card')
    const onovlennya = this.znayty('refresh-state')

    if (this._zavantazhennya && !this._tlumachennya) {
      zavantazhennya.style.display = 'grid'
      kartaTlum.style.display = 'none'
      onovlennya.style.display = 'none'
      return
    }

    zavantazhennya.style.display = 'none'
    onovlennya.style.display = this._zavantazhennya && this._tlumachennya ? 'flex' : 'none'

    if (!this._tlumachennya) {
      kartaTlum.style.display = 'none'
      return
    }

    kartaTlum.style.display = 'grid'

    const providerPill = this.znayty('provider-pill')
    if (this._tlumachennya.provider) {
      providerPill.style.display = ''
      providerPill.textContent = this._tlumachennya.provider === 'llm' ? 'ШІ' : 'запасний варіант'
    } else providerPill.style.display = 'none'

    this.znayty('interp-title').textContent = this._tlumachennya.title
    this.znayty('interp-summary').textContent = this._tlumachennya.summary
    this.znayty('interp-energy').textContent = this._tlumachennya.energy

    const blokVzayemodiy = this.znayty('interactions-block')
    const spysokVzayemodiy = this.znayty('interactions-list')
    if (this._tlumachennya.interactions?.length) {
      blokVzayemodiy.style.display = ''
      spysokVzayemodiy.innerHTML = ''
      this._tlumachennya.interactions.forEach((item) => {
        const li = document.createElement('li')
        li.textContent = item
        spysokVzayemodiy.appendChild(li)
      })
    } else blokVzayemodiy.style.display = 'none'

    const spysokPorad = this.znayty('advice-list')
    spysokPorad.innerHTML = ''
    this._tlumachennya.advice?.forEach((item) => {
      const li = document.createElement('li')
      li.textContent = item
      spysokPorad.appendChild(li)
    })

    this.znayty('shadow-text').textContent = this._tlumachennya.shadow
    this.znayty('next-step-text').textContent = this._tlumachennya.nextStep
  }
}

vyznachyty('interpretation-panel', InterpretationPanel)
