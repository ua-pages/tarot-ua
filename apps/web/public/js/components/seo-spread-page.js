import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { fetchSpreadDefinitions } from '../services/api.js'
import { buildFaqJsonLd, setJsonLd, setSeoMeta } from '../seo/meta.js'
import { ORG_NAME, SPREAD_DEFAULT_DESCRIPTION } from '../constants/seo.js'
import { SPREAD_SLUG_TO_TYPE, SPREAD_USE_CASE } from '../constants/spreads.js'

export class SeoSpreadPage extends Komponent {
  constructor() {
    super()
    this._slah = ''
    this._vyznachennyaRozkladu = null
  }

  vyvesty() {
    return `
      <main class="seo-page">
        <a class="seo-back" href="/">← До головної</a>
        <section id="loading-state" class="seo-panel">Завантажую розклад...</section>
        <section id="not-found" class="seo-panel" style="display:none">
          <p class="eyebrow">404</p>
          <h1>Розклад не знайдено</h1>
          <p class="muted">Можливо, цей тип розкладу ще не додано.</p>
          <a class="seo-btn" href="/">Обрати інший розклад</a>
        </section>
        <div id="spread-content" style="display:none">
          <section class="seo-hero">
            <div class="seo-copy">
              <p class="eyebrow">Розклад Таро</p>
              <h1 id="spread-title"></h1>
              <p id="spread-description" class="seo-lead"></p>
              <a id="try-btn" class="seo-btn" href="/">Спробувати цей розклад</a>
            </div>
            <div id="spread-preview" class="seo-spread-preview"></div>
          </section>
          <section class="seo-panel seo-wide">
            <h2>Коли обирати цей розклад</h2>
            <p id="use-case-text"></p>
          </section>
          <section id="positions-grid" class="seo-grid positions-grid" aria-label="Позиції розкладу"></section>
          <section class="seo-panel seo-wide seo-faq" aria-labelledby="spread-faq-title">
            <h2 id="spread-faq-title">Поширені питання</h2>
            <div id="spread-faq"></div>
          </section>
        </div>
      </main>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    if (this._slah) this.zavantazytyRozklad()
    this.znayty('.seo-back').addEventListener('click', (e) => {
      e.preventDefault()
      window.navigateTo('/')
    })
  }

  static get observedAttributes() { return ['slug'] }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'slug' && oldVal !== newVal && newVal) {
      this._slah = newVal
      this.zavantazytyRozklad()
    }
  }

  async zavantazytyRozklad() {
    const koren = this._tin
    koren.getElementById('loading-state').style.display = 'block'
    koren.getElementById('not-found').style.display = 'none'
    koren.getElementById('spread-content').style.display = 'none'

    try {
      const vyznachennya = await fetchSpreadDefinitions()
      const typ = SPREAD_SLUG_TO_TYPE[this._slah] || this._slah
      this._vyznachennyaRozkladu = vyznachennya.find((item) => item.id === typ) || null

      koren.getElementById('loading-state').style.display = 'none'

      if (!this._vyznachennyaRozkladu) {
        koren.getElementById('not-found').style.display = 'block'
        setSeoMeta({
          title: `Розклад не знайдено — ${ORG_NAME}`,
          description: 'Сторінку розкладу Таро не знайдено.',
          canonicalPath: `/spreads/${this._slah}`
        })
        return
      }

      this.namalyuvatyRozklad()
    } catch {
      koren.getElementById('loading-state').textContent = 'Помилка завантаження'
    }
  }

  namalyuvatyRozklad() {
    const koren = this._tin
    const def = this._vyznachennyaRozkladu
    koren.getElementById('spread-content').style.display = 'block'

    const seoOpys = `${def.title} — онлайн-розклад на ${def.count} карт із поясненням кожної позиції та цілісним тлумаченням.`
    const vykorystannya = SPREAD_USE_CASE[def.id] || ''

    koren.getElementById('spread-title').textContent = def.title
    koren.getElementById('spread-description').textContent = seoOpys
    koren.getElementById('use-case-text').textContent = vykorystannya

    const tryBtn = koren.getElementById('try-btn')
    tryBtn.href = `/?spread=${def.id}`
    tryBtn.addEventListener('click', (e) => {
      e.preventDefault()
      window.navigateTo(`/?spread=${def.id}`)
    })

    const pereglyad = koren.getElementById('spread-preview')
    pereglyad.className = `seo-spread-preview cards-${def.count}`
    pereglyad.innerHTML = ''
    def.positions.forEach((_, indeks) => {
      const span = document.createElement('span')
      span.textContent = String(indeks + 1)
      pereglyad.appendChild(span)
    })

    const pozyciiSitka = koren.getElementById('positions-grid')
    pozyciiSitka.innerHTML = ''
    def.positions.forEach((pozycia, indeks) => {
      const stattya = document.createElement('article')
      stattya.className = 'seo-panel'
      stattya.innerHTML = `
        <p class="eyebrow">Позиція ${indeks + 1}</p>
        <h2>${pozycia.name}</h2>
        <p>${pozycia.description}</p>
      `
      pozyciiSitka.appendChild(stattya)
    })

    const faqZapysy = [
      { question: `Для чого підходить розклад «${def.title}»?`, answer: vykorystannya },
      { question: `Скільки карт у цьому розкладі?`, answer: `У цьому розкладі ${def.count} карт із поясненням кожної позиції.` },
      { question: 'Чи можна зробити цей розклад онлайн?', answer: 'Так, можна перейти до інтерактивного розкладу, отримати карти та зберегти або поділитися результатом.' }
    ]

    const faqKonteyner = koren.getElementById('spread-faq')
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

    const tytul = `${def.title} — онлайн-розклад Таро`
    setSeoMeta({
      title: tytul,
      description: seoOpys,
      canonicalPath: `/spreads/${this._slah}`,
      type: 'article'
    })

    setJsonLd('spread-page', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: tytul,
      description: seoOpys,
      author: { '@type': 'Organization', name: ORG_NAME },
      mainEntityOfPage: `${window.location.origin}/spreads/${this._slah}`
    })
    setJsonLd('spread-faq', buildFaqJsonLd(faqZapysy))
  }
}

vyznachyty('seo-spread-page', SeoSpreadPage)
