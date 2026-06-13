import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { cardMeaning } from '../utils.js'
import { CARD_REVEAL_DELAY_STEP, DETAIL_REVEAL_OFFSET, DETAIL_REVEAL_DELAY_STEP } from '../constants/animations.js'

export class SpreadBoard extends Komponent {
  constructor() {
    super()
    this._spread = []
    this._aktyvneVyznachennya = null
    this._zavantazhennya = false
    this._klyuchVidkryttya = 0
    this._pulsDoshky = false
    this._stanKopii = ''
    this._zavantazhennyaPoshyrennya = false
  }

  vyvesty() {
    return `
      <section id="board-section" class="panel board-panel">
        <div class="section-head">
          <div>
            <p class="eyebrow">Розкриття карт</p>
            <h2>Поточний розклад</h2>
            <p id="active-title" class="muted"></p>
          </div>
          <div id="section-actions" class="section-actions" style="display:none">
            <button id="fav-btn" class="btn btn-secondary">★ В обране</button>
            <button id="copy-btn" class="btn btn-ghost">Копіювати текст</button>
            <button id="share-btn" class="btn btn-share">📸 Поділитись</button>
          </div>
        </div>

        <div id="shuffle-state" class="shuffle-stage" aria-live="polite" style="display:none">
          <div class="shuffle-stack" aria-hidden="true">
            <span class="shuffle-card" style="--shuffle-index: 0"></span>
            <span class="shuffle-card" style="--shuffle-index: 1"></span>
            <span class="shuffle-card" style="--shuffle-index: 2"></span>
            <span class="shuffle-card" style="--shuffle-index: 3"></span>
            <span class="shuffle-card" style="--shuffle-index: 4"></span>
          </div>
          <p class="muted">Перемішую колоду...</p>
        </div>

        <div id="spread-3" class="spread-grid-3" style="display:none"></div>
        <div id="spread-5" class="spread-layout-clean" style="display:none"></div>
        <p id="empty-state" class="muted">Обери тип розкладу й натисни кнопку.</p>
        <p id="copy-status" class="success" style="display:none"></p>
      </section>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.znayty('fav-btn').addEventListener('click', () => this.vyslaty('favorite'))
    this.znayty('copy-btn').addEventListener('click', () => this.vyslaty('copy'))
    this.znayty('share-btn').addEventListener('click', () => this.vyslaty('share'))
  }

  set spread(val) {
    this._spread = val
    this.namalyuvaty()
  }

  set activeDefinition(val) {
    this._aktyvneVyznachennya = val
    this.znayty('active-title').textContent = val?.title || ''
  }

  set loading(val) {
    this._zavantazhennya = val
    this.namalyuvaty()
  }

  set revealKey(val) { this._klyuchVidkryttya = val }
  set boardPulse(val) { this._pulsDoshky = val; this.namalyuvatyPuls() }

  set copyStatus(val) {
    this._stanKopii = val
    const el = this.znayty('copy-status')
    if (val) {
      el.textContent = val
      el.style.display = ''
      setTimeout(() => { el.style.display = 'none' }, 4000)
    } else el.style.display = 'none'
  }

  set shareLoading(val) {
    this._zavantazhennyaPoshyrennya = val
    this.znayty('share-btn').disabled = val
  }

  namalyuvatyPuls() {
    const sektsiya = this.znayty('board-section')
    sektsiya.classList.toggle('board-focus', this._pulsDoshky)
  }

  namalyuvaty() {
    const tasuvannya = this.znayty('shuffle-state')
    const spread3 = this.znayty('spread-3')
    const spread5 = this.znayty('spread-5')
    const pusto = this.znayty('empty-state')
    const diyi = this.znayty('section-actions')

    if (this._zavantazhennya) {
      tasuvannya.style.display = 'grid'
      spread3.style.display = 'none'
      spread5.style.display = 'none'
      pusto.style.display = 'none'
      return
    }

    tasuvannya.style.display = 'none'

    if (this._spread.length === 3) {
      spread3.style.display = 'grid'
      spread5.style.display = 'none'
      pusto.style.display = 'none'
      diyi.style.display = ''
      this.namalyuvatySpread3(spread3)
    } else if (this._spread.length === 5) {
      spread3.style.display = 'none'
      spread5.style.display = ''
      pusto.style.display = 'none'
      diyi.style.display = ''
      this.namalyuvatySpread5(spread5)
    } else {
      spread3.style.display = 'none'
      spread5.style.display = 'none'
      pusto.style.display = ''
      diyi.style.display = 'none'
    }
  }

  namalyuvatySpread3(konteyner) {
    konteyner.innerHTML = ''
    this._spread.forEach((item, indeks) => {
      const stattya = document.createElement('article')
      stattya.className = 'card-item'
      stattya.style = `--reveal-delay: ${indeks * CARD_REVEAL_DELAY_STEP}ms`

      const vizual = document.createElement('div')
      vizual.className = 'card-visual animated-card'
      const img = document.createElement('img')
      img.className = `card-image${item.reversed ? ' is-reversed' : ''}`
      img.src = item.card.image
      img.alt = item.card.name
      img.loading = 'lazy'
      img.decoding = 'async'
      img.addEventListener('error', (e) => this.dispatchEvent(new CustomEvent('image-error', { detail: e })))
      vizual.appendChild(img)

      if (item.reversed) {
        const badge = document.createElement('span')
        badge.className = 'reversed-badge'
        badge.textContent = '↻ перевернута'
        vizual.appendChild(badge)
      }

      stattya.appendChild(vizual)

      const pPos = document.createElement('p')
      pPos.className = 'position'
      pPos.textContent = item.position
      stattya.appendChild(pPos)

      const pHint = document.createElement('p')
      pHint.className = 'position-hint'
      pHint.textContent = item.positionDescription
      stattya.appendChild(pHint)

      const h3 = document.createElement('h3')
      h3.textContent = item.card.name
      stattya.appendChild(h3)

      const pKey = document.createElement('p')
      pKey.className = 'keywords'
      pKey.textContent = item.card.keywords.join(' · ')
      stattya.appendChild(pKey)

      const pMean = document.createElement('p')
      pMean.className = 'meaning'
      pMean.textContent = cardMeaning(item)
      stattya.appendChild(pMean)

      konteyner.appendChild(stattya)
    })
  }

  namalyuvatySpread5(konteyner) {
    konteyner.innerHTML = ''

    const doshka = document.createElement('div')
    doshka.className = 'spread-board-clean'
    doshka.setAttribute('aria-label', 'Пентаграма розкладу')

    this._spread.forEach((item, indeks) => {
      const slot = document.createElement('div')
      slot.className = `board-slot position-${indeks}`
      slot.style = `--reveal-delay: ${indeks * CARD_REVEAL_DELAY_STEP}ms`

      const ramka = document.createElement('div')
      ramka.className = 'board-card-frame animated-card'
      const img = document.createElement('img')
      img.className = `board-card-image${item.reversed ? ' is-reversed' : ''}`
      img.src = item.card.image
      img.alt = item.card.name
      img.loading = 'lazy'
      img.decoding = 'async'
      img.addEventListener('error', (e) => this.dispatchEvent(new CustomEvent('image-error', { detail: e })))
      ramka.appendChild(img)

      if (item.reversed) {
        const badge = document.createElement('span')
        badge.className = 'board-reversed'
        badge.textContent = '↻'
        ramka.appendChild(badge)
      }

      slot.appendChild(ramka)

      const pidpys = document.createElement('div')
      pidpys.className = 'board-caption'
      pidpys.innerHTML = `
        <strong>${indeks + 1}. ${item.position}</strong>
        <span>${item.card.name}</span>
      `
      slot.appendChild(pidpys)

      doshka.appendChild(slot)
    })

    konteyner.appendChild(doshka)

    const detal = document.createElement('div')
    detal.className = 'spread-details-clean'

    this._spread.forEach((item, indeks) => {
      const ryadok = document.createElement('div')
      ryadok.className = 'detail-row reveal-detail'
      ryadok.style = `--reveal-delay: ${DETAIL_REVEAL_OFFSET + indeks * DETAIL_REVEAL_DELAY_STEP}ms`

      const num = document.createElement('span')
      num.className = 'detail-number'
      num.textContent = String(indeks + 1)
      ryadok.appendChild(num)

      const div = document.createElement('div')
      const posP = document.createElement('p')
      posP.className = 'position'
      posP.innerHTML = `${item.position}${item.reversed ? ' <span class="inline-reversed">/ перевернута</span>' : ''}`
      div.appendChild(posP)

      const hintP = document.createElement('p')
      hintP.className = 'position-hint'
      hintP.textContent = item.positionDescription
      div.appendChild(hintP)

      const h3 = document.createElement('h3')
      h3.textContent = item.card.name
      div.appendChild(h3)

      const keyP = document.createElement('p')
      keyP.className = 'keywords'
      keyP.textContent = item.card.keywords.join(' · ')
      div.appendChild(keyP)

      const meanP = document.createElement('p')
      meanP.className = 'meaning'
      meanP.textContent = cardMeaning(item)
      div.appendChild(meanP)

      ryadok.appendChild(div)
      detal.appendChild(ryadok)
    })

    konteyner.appendChild(detal)
  }
}

vyznachyty('spread-board', SpreadBoard)
