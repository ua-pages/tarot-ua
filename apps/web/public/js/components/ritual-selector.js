import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { spreadMeta } from '../constants/spreads.js'

export class RitualSelector extends Komponent {
  constructor() {
    super()
    this._vyznachennya = []
    this._aktyvnyyTyp = 'classic3'
    this._zghornuto = false
    this._zavantazhennya = false
  }

  vyvesty() {
    return `
      <section id="ritual-section" class="panel controls-panel ritual-panel">
        <div class="ritual-head practice-head">
          <div>
            <p class="eyebrow">Спосіб тихої сесії</p>
            <h2>Якою буде ваша практика?</h2>
            <p class="muted">Не шукайте "правильний" варіант. Оберіть той ритм, який сьогодні відчувається спокійніше.</p>
          </div>
          <button id="expand-btn" class="btn btn-ghost" type="button" style="display:none">Змінити практику</button>
        </div>
        <div id="selector-grid" class="spread-selector spread-selector-v2 practice-grid"></div>
        <div id="active-summary" class="active-ritual-summary active-practice-summary" style="display:none"></div>
      </section>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.znayty('expand-btn').addEventListener('click', () => {
      this._zghornuto = false
      this.onovlytyUI()
      this.vyslaty('expand')
    })
  }

  set definitions(val) {
    this._vyznachennya = val
    this.onovlytyUI()
  }

  set activeType(val) {
    this._aktyvnyyTyp = val
    this.onovlytyUI()
  }

  set collapsed(val) {
    this._zghornuto = val
    this.onovlytyUI()
  }

  set loading(val) {
    this._zavantazhennya = val
    this.onovlytyUI()
  }

  onovlytyUI() {
    const sektsiya = this.znayty('ritual-section')
    const sitka = this.znayty('selector-grid')
    const rozhornuty = this.znayty('expand-btn')
    const sumary = this.znayty('active-summary')

    sektsiya.classList.toggle('collapsed', this._zghornuto)
    rozhornuty.style.display = this._zghornuto ? '' : 'none'

    if (this._zghornuto) {
      sitka.style.display = 'none'
      const aktyvne = this._vyznachennya.find((d) => d.id === this._aktyvnyyTyp)
      if (aktyvne) {
        const meta = spreadMeta(aktyvne.id)
        sumary.style.display = 'flex'
        sumary.innerHTML = `
          <span>${meta.icon}</span>
          <div>
            <strong>${meta.title}</strong>
            <small>${meta.description}</small>
          </div>
        `
      }
    } else {
      sitka.style.display = ''
      sumary.style.display = 'none'
      this.namalyuvatySitku(sitka)
    }
  }

  namalyuvatySitku(konteyner) {
    konteyner.innerHTML = ''
    this._vyznachennya.forEach((def) => {
      const meta = spreadMeta(def.id)
      const btn = document.createElement('button')
      btn.className = `spread-button spread-choice practice-card${def.id === this._aktyvnyyTyp ? ' active' : ''}`
      btn.disabled = this._zavantazhennya
      btn.innerHTML = `
        <span class="practice-mark" aria-hidden="true">
          <span class="practice-count">${def.count}</span>
          <span class="practice-count-label">карт${def.count === 3 ? 'и' : ''}</span>
        </span>
        <span class="choice-body practice-body">
          <span class="practice-kicker">${meta.kicker}</span>
          <strong>${meta.title}</strong>
          <small>${meta.description}</small>
          <em>${meta.pace}</em>
        </span>
        <span class="practice-symbol" aria-hidden="true">${meta.icon}</span>
      `
      btn.addEventListener('click', () => {
        this.vyslaty('choose', def.id)
      })
      konteyner.appendChild(btn)
    })
  }
}

vyznachyty('ritual-selector', RitualSelector)
