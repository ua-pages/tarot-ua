import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { fetchCards } from '../services/api.js'
import { buildFaqJsonLd, setJsonLd, setSeoMeta } from '../seo/meta.js'
import { CARD_DEFAULT_DESCRIPTION, CARD_DEFAULT_TITLE, ORG_NAME } from '../constants/seo.js'

export class SeoCardPage extends Komponent {
  constructor() {
    super()
    this._slah = ''
    this._karta = null
  }

  vyvesty() {
    return `
      <main class="seo-page">
        <a class="seo-back" href="/">← До розкладу</a>
        <section id="loading-state" class="seo-panel">Завантажую значення карти...</section>
        <section id="not-found" class="seo-panel" style="display:none">
          <p class="eyebrow">404</p>
          <h1>Карту не знайдено</h1>
          <p class="muted">Схоже, такого аркана ще немає у колоді.</p>
          <a class="seo-btn" href="/">Повернутись до розкладу</a>
        </section>
        <div id="card-content" style="display:none">
          <section class="seo-hero seo-card-hero">
            <div class="seo-copy">
              <p class="eyebrow">Значення карти Таро</p>
              <h1 id="card-title"></h1>
              <p id="card-description" class="seo-lead"></p>
              <div id="card-tags" class="seo-tags"></div>
              <a class="seo-btn" href="/">Зробити розклад</a>
            </div>
            <img id="card-image" class="seo-card-image" src="" alt="" width="280" height="420" loading="eager" fetchpriority="high" />
          </section>
          <section class="seo-grid">
            <article class="seo-panel">
              <h2>Пряме положення</h2>
              <p id="meaning-upright"></p>
            </article>
            <article class="seo-panel accent">
              <h2>Перевернуте положення</h2>
              <p id="meaning-reversed"></p>
            </article>
            <article class="seo-panel">
              <h2 id="love-title"></h2>
              <p id="love-meaning"></p>
            </article>
            <article class="seo-panel">
              <h2 id="career-title"></h2>
              <p id="career-meaning"></p>
            </article>
          </section>
          <section class="seo-panel seo-wide">
            <h2>Порада карти</h2>
            <p id="card-advice"></p>
          </section>
          <section class="seo-panel seo-wide seo-faq" aria-labelledby="card-faq-title">
            <h2 id="card-faq-title">Поширені питання</h2>
            <div id="card-faq"></div>
          </section>
        </div>
      </main>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    if (this._slah) this.zavantazytyKartu()
    const backBtn = this.znayty('.seo-back')
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault()
        window.navigateTo('/')
      })
    }
    this.znaytyVsi('.seo-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        window.navigateTo('/')
      })
    })
  }

  static get observedAttributes() { return ['slug'] }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'slug' && oldVal !== newVal && newVal) {
      this._slah = newVal
      this.zavantazytyKartu()
    }
  }

  get isReversedPage() { return this._slah.endsWith('-reversed') }
  get cleanSlug() { return this._slah.replace(/-reversed$/, '') }

  get pageTitle() {
    if (!this._karta) return CARD_DEFAULT_TITLE
    return this.isReversedPage
      ? `Що означає перевернута ${this._karta.name}`
      : `Значення карти ${this._karta.name}`
  }

  get pageDescription() {
    if (!this._karta) return CARD_DEFAULT_DESCRIPTION
    const base = this.isReversedPage ? this._karta.meaningReversed : this._karta.meaningUpright
    return `${base} Ключові теми: ${this._karta.keywords.join(', ')}.`
  }

  async zavantazytyKartu() {
    const koren = this._tin
    koren.getElementById('loading-state').style.display = 'block'
    koren.getElementById('not-found').style.display = 'none'
    koren.getElementById('card-content').style.display = 'none'

    try {
      const karty = await fetchCards(78)
      this._karta = karty.find((item) => item.id === this.cleanSlug) || null

      koren.getElementById('loading-state').style.display = 'none'

      if (!this._karta) {
        koren.getElementById('not-found').style.display = 'block'
        setSeoMeta({
          title: `Карту не знайдено — ${ORG_NAME}`,
          description: 'Сторінку значення карти не знайдено.',
          canonicalPath: `/meaning/${this._slah}`
        })
        return
      }

      this.namalyuvatyKartu()
    } catch {
      koren.getElementById('loading-state').textContent = 'Помилка завантаження'
    }
  }

  namalyuvatyKartu() {
    const koren = this._tin
    const karta = this._karta
    koren.getElementById('card-content').style.display = 'block'

    koren.getElementById('card-title').textContent = this.pageTitle
    koren.getElementById('card-description').textContent = this.pageDescription

    const konteynerTegiv = koren.getElementById('card-tags')
    konteynerTegiv.innerHTML = ''
    karta.keywords.forEach((slovo) => {
      const span = document.createElement('span')
      span.textContent = slovo
      konteynerTegiv.appendChild(span)
    })

    const img = koren.getElementById('card-image')
    img.src = karta.image
    img.alt = karta.name
    img.className = 'seo-card-image' + (this.isReversedPage ? ' is-reversed' : '')

    koren.getElementById('meaning-upright').textContent = karta.meaningUpright
    koren.getElementById('meaning-reversed').textContent = karta.meaningReversed

    const ton = this.isReversedPage ? karta.meaningReversed : karta.meaningUpright
    koren.getElementById('love-title').textContent = `${karta.name} у коханні`
    koren.getElementById('love-meaning').textContent = `У стосунках ${karta.name} підсвічує тему «${karta.keywords[0]}». ${ton} Це запрошення чесно подивитися на бажання, межі та спосіб взаємодії з іншою людиною.`
    koren.getElementById('career-title').textContent = `${karta.name} у кар'єрі та грошах`
    koren.getElementById('career-meaning').textContent = `У роботі та фінансах ця карта говорить про ${karta.keywords.join(', ')}. ${ton} Сфокусуйся на практичному кроці, який можна зробити вже зараз.`

    const porada = this.isReversedPage
      ? 'Не тисни на ситуацію. Перевернута карта радить побачити блок, назвати його чесно й повернути собі опору через маленьку дію.'
      : `Використай енергію карти як напрямок: ${karta.keywords.join(', ')}. Один ясний крок краще за десять тривожних сценаріїв.`
    koren.getElementById('card-advice').textContent = porada

    const faqZapysy = [
      { question: `Що означає карта ${karta.name}?`, answer: karta.meaningUpright },
      { question: `Що означає ${karta.name} у перевернутому положенні?`, answer: karta.meaningReversed },
      { question: `Яка головна порада карти ${karta.name}?`, answer: porada }
    ]

    const faqKonteyner = koren.getElementById('card-faq')
    faqKonteyner.innerHTML = ''
    faqZapysy.forEach((item) => {
      const detal = document.createElement('details')
      const sumary = document.createElement('summary')
      sumary.textContent = item.question
      const p = document.createElement('p')
      p.textContent = item.answer
      detal.appendChild(sumary)
      detal.appendChild(p)
      faqKonteyner.appendChild(detal)
    })

    const tytul = `${this.pageTitle} — ${ORG_NAME}`
    setSeoMeta({
      title: tytul,
      description: this.pageDescription,
      canonicalPath: `/meaning/${this._slah}`,
      image: karta.image,
      type: 'article'
    })

    setJsonLd('card-meaning', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: this.pageTitle,
      description: this.pageDescription,
      image: `${window.location.origin}${karta.image}`,
      author: { '@type': 'Organization', name: ORG_NAME },
      mainEntityOfPage: `${window.location.origin}/meaning/${this._slah}`
    })
    setJsonLd('card-faq', buildFaqJsonLd(faqZapysy))
  }
}

vyznachyty('seo-card-page', SeoCardPage)
