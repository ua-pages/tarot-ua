import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { cardMeaning, delay } from '../utils.js'
import { drawSpread, fetchSpreadDefinitions, fetchSpreadInterpretation } from '../services/api.js'
import { saveSpreadSession, loadSpreadSession, saveInterpretationSession, loadInterpretationSession, loadNickname } from '../services/session-storage.js'
import { trackEvent } from '../analytics/analytics.js'

const SPREAD_META = [
  { id: 'classic3', icon: '✦', card: 'the-magician', name: 'Три карти', kicker: 'Класичний' },
  { id: 'pentagram5', icon: '✧', card: 'the-world', name: 'Пентаграма', kicker: 'Глибокий' },
  { id: 'love5', icon: '♡', card: 'the-lovers', name: 'Стосунки', kicker: 'Почуття' },
  { id: 'career5', icon: '⚜', card: 'ace-of-pentacles', name: 'Карʼєра', kicker: 'Шлях' }
]

const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ']

export class FastSession extends Komponent {
  constructor() {
    super()
    this.vyznachennyaRozkladiv = []
    this.aktyvnyyTyp = null
    this.spread = []
    this.tlumachennya = null
    this.zavantazhennya = false
  }

  vyvesty() {
    return `
      <div class="mystic-backdrop" aria-hidden="true"></div>
      <div class="mystic-runes" aria-hidden="true"></div>
      <main class="mystic-page page-enter">
        <section class="mystic-hero">
          <h1>Швидка містична сесія</h1>
          <p class="subtitle" id="session-subtitle">Оберіть практику — карти самі розкажуть історію. Жодної реєстрації, лише ви і символи.</p>
        </section>

        <section class="mystic-panel" id="spread-selector">
          <div class="mystic-panel-header">
            <h2>Оберіть розклад</h2>
            <span class="mystic-ornament">☾ ✦ ☾</span>
          </div>
          <div class="mystic-spread-grid" id="spread-grid"></div>
        </section>

        <section class="mystic-panel" id="cards-section" style="display:none">
          <div class="mystic-panel-header">
            <h2 id="spread-title">Ваш розклад</h2>
            <span class="mystic-ornament" id="card-count"></span>
          </div>
          <div class="mystic-cards" id="cards-container"></div>
          <div class="mystic-status" id="cards-status"></div>
        </section>

        <section class="mystic-panel" id="interpretation-section" style="display:none">
          <div class="mystic-panel-header">
            <h2>Тлумачення</h2>
            <span class="mystic-ornament">✧ ✦ ✧</span>
          </div>
          <div class="mystic-interp" id="interp-content"></div>
        </section>

        <div class="mystic-loading" id="loading-indicator" style="display:none">
          <div class="mystic-loading-cards">
            <div class="mystic-loading-card-back"></div>
            <div class="mystic-loading-card-back"></div>
            <div class="mystic-loading-card-back"></div>
            <div class="mystic-loading-card-back"></div>
            <div class="mystic-loading-card-back"></div>
          </div>
          <span>Карти відкриваються...</span>
        </div>

        <div class="mystic-nav">
          <a href="/session" id="full-session-link">Повна сесія зі збереженням</a>
          <a href="/" id="home-link">На головну</a>
        </div>
      </main>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    const nik = loadNickname()
    const pid = this.znayty('session-subtitle')
    if (nik && pid) {
      pid.textContent = `Вітаю, ${nik}. Оберіть практику — карти самі розкажуть історію.`
    }
    this.pryvYazatyPodiyi()
    this.namalyuvatySitkuRozkladiv()
    this.stvorytyRuny()
    try { this.vyznachennyaRozkladiv = await fetchSpreadDefinitions() } catch {}
    this.sprobuVidnovytySesiyu()
  }

  disconnectedCallback() {
    this._ochyshchennya?.()
  }

  stvorytyRuny() {
    const konteyner = this.znayty('.mystic-runes')
    const symvoly = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛝ', 'ᛟ', 'ᛞ', '☽', '☾', '✧', '✦', '♰', '⚜']
    for (let i = 0; i < 12; i++) {
      const el = document.createElement('span')
      el.className = 'mystic-rune'
      el.textContent = symvoly[i % symvoly.length]
      el.style.left = `${Math.random() * 100}%`
      el.style.fontSize = `${0.7 + Math.random() * 1.2}rem`
      el.style.setProperty('--duration', `${15 + Math.random() * 25}s`)
      el.style.setProperty('--delay', `${Math.random() * 20}s`)
      konteyner.appendChild(el)
    }
  }

  pryvYazatyPodiyi() {
    this.znayty('full-session-link').addEventListener('click', (e) => {
      e.preventDefault()
      window.navigateTo('/session')
    })
    this.znayty('home-link').addEventListener('click', (e) => {
      e.preventDefault()
      window.navigateTo('/')
    })
  }

  namalyuvatySitkuRozkladiv() {
    const sitka = this.znayty('spread-grid')
    sitka.innerHTML = SPREAD_META.map((s) => `
      <div class="mystic-spread-card" data-id="${s.id}">
        <img src="/cards/${s.card}.svg" alt="" class="mystic-spread-mini-card" loading="lazy" onerror="this.style.display='none'">
        <span class="icon">${s.icon}</span>
        <span class="name">${s.name}</span>
        <span class="kicker">${s.kicker}</span>
      </div>
    `).join('')

    sitka.querySelectorAll('.mystic-spread-card').forEach((karta) => {
      karta.addEventListener('click', () => this.vybratyRozklad(karta.dataset.id))
      karta.addEventListener('mousemove', (e) => {
        const rect = karta.getBoundingClientRect()
        karta.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`)
        karta.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`)
      })
    })
  }

  sprobuVidnovytySesiyu() {
    const zberezhenyy = loadSpreadSession()
    if (zberezhenyy?.spread?.length) {
      this.aktyvnyyTyp = zberezhenyy.spreadType
      this.spread = zberezhenyy.spread
      this.tlumachennya = loadInterpretationSession()
      this.namalyuvatyRozklad()
      if (this.tlumachennya) this.namalyuvatyTlumachennya()
      this.pidsvitytyObranyy()
    }
  }

  pidsvitytyObranyy() {
    this.znaytyVsi('.mystic-spread-card').forEach((karta) => {
      karta.classList.toggle('active', karta.dataset.id === this.aktyvnyyTyp)
    })
  }

  async vybratyRozklad(typ) {
    if (this.zavantazhennya) return
    this.aktyvnyyTyp = typ
    this.pidsvitytyObranyy()
    this.animatsiyaTasuvannya()
    this.zavantazhennya = true
    this.pokazatyZavantazhennya(true)

    try {
      const vyznachennya = this.vyznachennyaRozkladiv.find((d) => d.id === typ)
      const [karty] = await Promise.all([
        drawSpread(vyznachennya?.count ?? 3, typ),
        delay(600)
      ])
      this.spread = karty
      saveSpreadSession({ spreadType: typ, spread: karty })
      trackEvent('fast_spread_drawn', { spreadType: typ, cardsCount: karty.length })

      this.namalyuvatyRozklad()
      this.svitinnyaPaneli('cards-section')

      const tlum = await fetchSpreadInterpretation(karty, typ, 'psychological')
      this.tlumachennya = tlum
      saveInterpretationSession(tlum)

      this.namalyuvatyTlumachennya()
      this.svitinnyaPaneli('interpretation-section')
      trackEvent('fast_interpretation_generated', { spreadType: typ, provider: tlum.provider })
    } catch (err) {
      this.pokazatyPomylku(err instanceof Error ? err.message : 'Щось пішло не так')
    } finally {
      this.zavantazhennya = false
      this.pokazatyZavantazhennya(false)
    }
  }

  animatsiyaTasuvannya() {
    const sitka = this.znayty('spread-grid')
    sitka.querySelectorAll('.mystic-spread-card').forEach((karta) => {
      karta.classList.add('mystic-shuffling')
      setTimeout(() => karta.classList.remove('mystic-shuffling'), 2000)
    })
  }

  svitinnyaPaneli(id) {
    const panel = this.znayty(id)
    if (panel) {
      panel.classList.add('glow')
      setTimeout(() => panel.classList.remove('glow'), 3000)
    }
  }

  namalyuvatyRozklad() {
    const def = this.vyznachennyaRozkladiv.find((d) => d.id === this.aktyvnyyTyp)
    const tytul = def?.title ?? SPREAD_META.find((m) => m.id === this.aktyvnyyTyp)?.name ?? 'Розклад'
    const konteyner = this.znayty('cards-container')
    const status = this.znayty('cards-status')
    const sektsiya = this.znayty('cards-section')

    sektsiya.style.display = ''
    this.znayty('spread-title').textContent = tytul
    this.znayty('card-count').textContent = `${this.spread.length} карти`

    konteyner.innerHTML = this.spread.map((item, i) => `
      <div class="mystic-card-slot revealing" style="animation-delay:${i * 0.2}s">
        <img src="${item.card.image}" alt="${item.card.name}"
          loading="lazy"
          onerror="this.src='/cards/tarot-placeholder.svg'">
        <div class="position">${item.position}</div>
        <div class="card-name">${item.card.name}${item.reversed ? ' ⇄' : ''}</div>
        <div class="card-meaning">${cardMeaning(item)}</div>
      </div>
    `).join('')

    status.textContent = ''
    requestAnimationFrame(() => {
      const tytulEl = this.znayty('spread-title')
      if (tytulEl) tytulEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  enerhiyaOpys(opys) {
    if (!opys) return 'medium'
    const d = opys.toLowerCase()
    if (/напружен|інтенси|бурхлив|пристрасн|вогнян/i.test(d)) return 'intense'
    if (/спокійн|гармоні|ясн|легк|м'як/i.test(d)) return 'high'
    if (/застій|важк|туман|мряк/i.test(d)) return 'low'
    return 'medium'
  }

  enerhiyaIkonka(teh) {
    const ikonky = { high: '🌿', medium: '🌊', low: '🌙', intense: '⚡' }
    return ikonky[teh] || '🌊'
  }

  namalyuvatyTlumachennya() {
    if (!this.tlumachennya) return
    const sektsiya = this.znayty('interpretation-section')
    const vmist = this.znayty('interp-content')
    sektsiya.style.display = ''
    vmist.className = 'mystic-interp revealing'

    const tlum = this.tlumachennya

    const enerhiyaTeh = this.enerhiyaOpys(tlum.energy)
    const enerhiyaIko = this.enerhiyaIkonka(enerhiyaTeh)
    const enerhiyaKorotko = tlum.energy
      ? tlum.energy.replace(/<[^>]+>/g, '').split(/[.;]/)[0].trim()
      : ''

    const persheRechemya = (html) => {
      const t = html.replace(/<[^>]+>/g, '').trim()
      const m = t.match(/^[^.!?]+[.!?]+/)
      return m ? m[0].trim() : t.slice(0, 120)
    }

    const fragmentyKart = (this.spread || []).map((item) =>
      `<div class="post-fragment">
        <span class="post-label">${item.position}</span>
        <span class="post-card-name">${item.card.name}${item.reversed ? ' ⇄' : ''}</span>
        <span class="post-insight">${persheRechemya(cardMeaning(item))}</span>
      </div>`
    ).join('')

    const vzayemodiiFragmenty = Array.isArray(tlum.interactions)
      ? tlum.interactions.map((i) => `<div class="post-fragment post-interaction">${persheRechemya(i)}</div>`).join('')
      : ''

    const poradaFragmenty = Array.isArray(tlum.advice)
      ? tlum.advice.map((a) => `<div class="post-fragment post-advice">${persheRechemya(a)}</div>`).join('')
      : tlum.advice
        ? `<div class="post-fragment post-advice">${persheRechemya(tlum.advice)}</div>`
        : ''

    const tinFragment = tlum.shadow
      ? `<div class="post-fragment post-shadow">${persheRechemya(tlum.shadow)}</div>`
      : ''

    const fragmentHtml = `
      <div class="post-mode" id="post-mode">
        <div class="post-header">
          <span class="post-energy ${enerhiyaTeh}">${enerhiyaIko} ${enerhiyaKorotko || 'енергія'}</span>
          <span class="post-summary-preview">${persheRechemya(tlum.summary)}</span>
        </div>
        <div class="post-divider"></div>
        ${fragmentyKart}
        ${vzayemodiiFragmenty ? `<div class="post-divider"></div>${vzayemodiiFragmenty}` : ''}
        ${poradaFragmenty ? `<div class="post-divider"></div>${poradaFragmenty}` : ''}
        ${tinFragment ? `<div class="post-divider"></div>${tinFragment}` : ''}
      </div>
    `

    let povnyHtml = ''
    if (tlum.summary) povnyHtml += `<div class="summary">${tlum.summary}</div>`
    if (tlum.energy) povnyHtml += `<section><h3>Енергія розкладу</h3><p>${tlum.energy}</p></section>`
    if (Array.isArray(tlum.interactions)) {
      povnyHtml += `<section><h3>Взаємодії карт</h3>${tlum.interactions.map((i) => `<p>${i}</p>`).join('')}</section>`
    }
    if (Array.isArray(tlum.cards)) {
      tlum.cards.forEach((karta) => {
        if (karta?.interpretation) {
          povnyHtml += `<section><h3>${karta.position || 'Карта'}</h3><p>${karta.interpretation}</p></section>`
        }
      })
    }
    if (Array.isArray(tlum.advice)) {
      povnyHtml += `<div class="advice"><h3>Порада</h3>${tlum.advice.map((a) => `<p>${a}</p>`).join('')}</div>`
    } else if (tlum.advice) {
      povnyHtml += `<div class="advice"><h3>Порада</h3><p>${tlum.advice}</p></div>`
    }
    if (tlum.shadow) povnyHtml += `<section><h3>Тінь</h3><p>${tlum.shadow}</p></section>`

    vmist.innerHTML = `
      <div class="post-view" id="post-view">
        ${fragmentHtml}
      </div>
      <div class="detail-view" id="detail-view" style="display:none">
        ${povnyHtml || '<p style="color:rgba(200,185,230,0.5);text-align:center">Тлумачення готується...</p>'}
      </div>
      <div class="post-toggle-bar">
        <button class="post-toggle-btn active" id="toggle-frag">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
          Стисло
        </button>
        <button class="post-toggle-btn" id="toggle-detail">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          Детально
        </button>
      </div>
    `

    const fragView = vmist.querySelector('#post-view')
    const detalView = vmist.querySelector('#detail-view')
    const fragBtn = vmist.querySelector('#toggle-frag')
    const detalBtn = vmist.querySelector('#toggle-detail')

    if (fragBtn && detalBtn && fragView && detalView) {
      fragBtn.addEventListener('click', () => {
        fragView.style.display = ''
        detalView.style.display = 'none'
        fragBtn.classList.add('active')
        detalBtn.classList.remove('active')
      })
      detalBtn.addEventListener('click', () => {
        fragView.style.display = 'none'
        detalView.style.display = ''
        detalBtn.classList.add('active')
        fragBtn.classList.remove('active')
      })
    }

    requestAnimationFrame(() => {
      const header = sektsiya.querySelector('.mystic-panel-header')
      if (header) header.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    })
  }

  pokazatyZavantazhennya(show) {
    this.znayty('loading-indicator').style.display = show ? '' : 'none'
  }

  pokazatyPomylku(msg) {
    const status = this.znayty('cards-status')
    status.innerHTML = `<div class="mystic-error">${msg}</div>`
  }
}

vyznachyty('fast-session', FastSession)
