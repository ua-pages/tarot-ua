import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { delay, getTodayLabel, cardMeaning } from '../utils.js'
import { buildSharePreview } from '../share-preview.js'
import { trackEvent, spreadAnalyticsPayload, interpretationAnalyticsPayload } from '../analytics/analytics.js'
import { getFlags, onFlagsChange } from '../analytics/use-features.js'
import { INTERPRETATION_TONES } from '../constants/interpretation.js'
import {
  createShareableSpread, drawSpread, fetchCardOfDay,
  fetchCards, fetchSharedSpread,
  fetchSpreadDefinitions, fetchSpreadInterpretation,
} from '../services/api.js'
import { loadJournal, addEntry, updateEntry, loadFavorites } from '../services/journal-storage.js'

export class TarotBoard extends Komponent {
  constructor() {
    super()
    this.potochnyyKorystuvach = null
    this.karty = []
    this.pokazatyKolodu = false
    this.zavantazhennyaKolody = false
    this.spread = []
    this.vyznachennyaRozkladiv = []
    this.aktyvnyyTyp = 'classic3'
    this.kartaDnya = null
    this.zavantazhennya = false
    this.klyuchVidkryttya = 0
    this.pomylka = ''
    this.stanKopii = ''
    this.tlumachennya = null
    this.zavantazhennyaTlumachennya = false
    this.tonTlumachennya = 'psychological'
    this.selectorZghornuto = false
    this.pulsDoshky = false
    this.istoriyaRozkladiv = []
    this.obraniRozklady = []
    this.rezultatPoshyrennya = null
    this.urlPereglyadu = ''
    this.zavantazhennyaPoshyrennya = false
    this.peredglyadPoshyrennya = false

    this._prapory = getFlags()
    this.sogodniPidpys = getTodayLabel()
    this.tonyTlumachennya = INTERPRETATION_TONES
  }

  vyvesty() {
    return `
      <main class="page session-page">
        <div class="ambient-orb orb-one" aria-hidden="true"></div>
        <div class="ambient-orb orb-two" aria-hidden="true"></div>

        <header class="hero hero-ritual" id="hero-header">
          <div class="hero-top">
            <a class="quiet-back-link" href="/" id="back-link">← На головну</a>
            <p class="eyebrow">Тиха сесія</p>
          </div>
          <h1>Почніть з того, що є всередині</h1>
          <p class="subtitle">Сформулюйте думку, яка зараз не відпускає. Оберіть практику — і дозвольте картам стати приводом для спокійної саморефлексії.</p>
          <div class="hero-actions">
            <button class="btn btn-large" type="button" id="scroll-ritual-btn">Зосередитись і обрати практику</button>
            <span class="hero-hint">пауза · символи · м'яка рефлексія · нотатки</span>
          </div>
        </header>

        <auth-panel id="auth-panel"></auth-panel>
        <ritual-selector id="ritual-selector"></ritual-selector>
        <card-of-day-panel id="card-of-day"></card-of-day-panel>
        <spread-board id="spread-board"></spread-board>
        <share-panel id="share-panel"></share-panel>

        <section id="premium-preview" class="panel premium-preview-panel" style="display:none">
          <p class="eyebrow">Попередній перегляд преміум</p>
          <h2>Глибше ШІ-тлумачення</h2>
          <p class="muted">Тут можна тестувати м'який upsell: розширений аналіз, персональні висновки, додаткові тони і довшу історію.</p>
          <button class="btn btn-secondary" type="button" id="premium-preview-btn">Подивитись можливості</button>
        </section>

        <interpretation-panel id="interpretation-panel"></interpretation-panel>
        <tarot-journal id="favorite-journal" title="Книга розкладів"></tarot-journal>
        <tarot-journal id="history-journal" title="Історія розкладів"></tarot-journal>
        <deck-panel id="deck-panel"></deck-panel>
      </main>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.pryvYazatyPodiyi()
    onFlagsChange((prapory) => {
      this._prapory = prapory
      this.onovytyPereglyadPrem()
    })

    trackEvent('app_opened', {})

    try {
      this.zavantazytyLokalnohoKorystuvacha()
      this.synkhronizuvatySpysky()
      await Promise.all([this.zavantazytyKartuDnya(), this.zavantazytyVyznachennyaRozkladiv()])

      const spivpadPoshyrennya = window.location.pathname.match(/^\/share\/([A-Za-z0-9_-]+)/)
      if (spivpadPoshyrennya?.[1]) {
        await this.zavantazytyPeredglyadPoshyrennya(spivpadPoshyrennya[1])
      } else {
        await this.onovytyRozklad('classic3')
        this.selectorZghornuto = false
      }
    } catch (err) {
      this.pomylka = err instanceof Error ? err.message : 'Сталася помилка'
    }
  }

  zavantazytyLokalnohoKorystuvacha() {
    const imya = localStorage.getItem('tarot-nickname') || ''
    if (imya) this.potochnyyKorystuvach = { name: imya }
    this.onovytyPanelKorystuvacha()
  }

  pryvYazatyPodiyi() {
    this.znayty('back-link').addEventListener('click', (e) => {
      e.preventDefault()
      window.navigateTo('/')
    })
    this.znayty('scroll-ritual-btn').addEventListener('click', () => {
      trackEvent('ritual_start_clicked')
      this.znayty('ritual-selector').scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    this.znayty('premium-preview-btn').addEventListener('click', () => {
      trackEvent('premium_preview_clicked', {
        spreadType: this.aktyvnyyTyp,
        hasSpread: Boolean(this.spread.length)
      })
    })

    this.znayty('auth-panel').addEventListener('name-changed', (e) => {
      this.potochnyyKorystuvach = e.detail.name ? { name: e.detail.name } : null
      this.synkhronizuvatySpysky()
    })
    this.znayty('ritual-selector').addEventListener('choose', (e) => this.vybratyRozklad(e.detail))
    this.znayty('ritual-selector').addEventListener('expand', () => { this.selectorZghornuto = false })
    this.znayty('spread-board').addEventListener('favorite', () => this.zberegtyObranyyRozklad())
    this.znayty('spread-board').addEventListener('copy', () => this.kopiyuvatyTekstRozkladu())
    this.znayty('spread-board').addEventListener('share', () => this.poshyrytyPotochnyyRozklad())
    this.znayty('spread-board').addEventListener('image-error', (e) => this.vstanovytyZamistneZobrazhennya(e.detail))
    this.znayty('interpretation-panel').addEventListener('set-tone', (e) => this.vstanovytyTonTlumachennya(e.detail))
    this.znayty('favorite-journal').addEventListener('open', (e) => this.vidkrytyZapysSchodennyka(e.detail))
    this.znayty('favorite-journal').addEventListener('save-note', (e) => this.zberegtyNotatkuSchodennyka(e.detail))
    this.znayty('favorite-journal').addEventListener('image-error', (e) => this.vstanovytyZamistneZobrazhennya(e.detail))
    this.znayty('history-journal').addEventListener('open', (e) => this.vidkrytyZapysSchodennyka(e.detail))
    this.znayty('history-journal').addEventListener('save-note', (e) => this.zberegtyNotatkuSchodennyka(e.detail))
    this.znayty('history-journal').addEventListener('image-error', (e) => this.vstanovytyZamistneZobrazhennya(e.detail))
    this.znayty('deck-panel').addEventListener('toggle', () => this.peremyknutyKolodu())
    this.znayty('deck-panel').addEventListener('image-error', (e) => this.vstanovytyZamistneZobrazhennya(e.detail))
    this.znayty('share-panel').addEventListener('copy-url', () => this.kopiyuvatyURLPoshyrennya())
    this.znayty('share-panel').addEventListener('native-share', () => this.systemnePoshyrennya())
    this.znayty('share-panel').addEventListener('select-url', (e) => { e.detail.target.select() })
  }

  onovytyPereglyadPrem() {
    this.znayty('premium-preview').style.display = this._prapory.premiumPreview ? '' : 'none'
  }

  onovytyPanelKorystuvacha() {
    const panel = this.znayty('auth-panel')
    if (panel.onovlytyUI) panel.onovlytyUI()
  }

  async vybratyRozklad(typ) {
    trackEvent('spread_selected', { spreadType: typ })
    this.selectorZghornuto = true
    this.onovytyVybirRytualu()
    await this.onovytyRozklad(typ)
    this.znayty('spread-board').scrollIntoView({ behavior: 'smooth' })
    this.pulsDoshky = true
    setTimeout(() => { this.pulsDoshky = false }, 1100)
  }

  async zavantazytyKarty() {
    if (this.karty.length || this.zavantazhennyaKolody) return
    this.zavantazhennyaKolody = true
    try { this.karty = await fetchCards(78) }
    finally {
      this.zavantazhennyaKolody = false
      this.onovytyPanelKolody()
    }
  }

  async peremyknutyKolodu() {
    this.pokazatyKolodu = !this.pokazatyKolodu
    trackEvent('deck_toggled', { expanded: this.pokazatyKolodu })
    this.onovytyPanelKolody()
    if (this.pokazatyKolodu) await this.zavantazytyKarty()
  }

  onovytyPanelKolody() {
    const panel = this.znayty('deck-panel')
    panel.cards = this.karty
    panel.showDeck = this.pokazatyKolodu
    panel.loading = this.zavantazhennyaKolody
  }

  async zavantazytyVyznachennyaRozkladiv() {
    this.vyznachennyaRozkladiv = await fetchSpreadDefinitions()
    this.onovytyVybirRytualu()
  }

  vstanovytyZamistneZobrazhennya(event) {
    const zobrazhennya = event.target
    if (zobrazhennya.src.endsWith('/cards/tarot-placeholder.svg')) return
    zobrazhennya.src = '/cards/tarot-placeholder.svg'
  }

  async zavantazytyKartuDnya() {
    this.kartaDnya = await fetchCardOfDay()
    trackEvent('daily_card_opened', {
      cardId: this.kartaDnya.card.id,
      reversed: this.kartaDnya.reversed
    })
    this.onovytyKartuDnya()
  }

  onovytyKartuDnya() {
    const panel = this.znayty('card-of-day')
    panel.card = this.kartaDnya
    panel.todayLabel = this.sogodniPidpys
    panel.error = this.pomylka
  }

  onovytyVybirRytualu() {
    const vybir = this.znayty('ritual-selector')
    vybir.definitions = this.vyznachennyaRozkladiv
    vybir.activeType = this.aktyvnyyTyp
    vybir.collapsed = this.selectorZghornuto
    vybir.loading = this.zavantazhennya
  }

  async onovytyRozklad(typ = this.aktyvnyyTyp) {
    this.tlumachennya = null
    const vyznachennya = this.vyznachennyaRozkladiv.find((item) => item.id === typ)
    this.aktyvnyyTyp = typ
    this.zavantazhennya = true
    this.pomylka = ''
    this.stanKopii = ''
    this.rezultatPoshyrennya = null
    this.urlPereglyadu = ''

    this.onovytyDoshkuRozkladu()

    try {
      const [karty] = await Promise.all([
        drawSpread(vyznachennya?.count ?? 3, typ),
        delay(520)
      ])
      this.spread = karty
      this.klyuchVidkryttya += this._prapory.enhancedReveal ? 1 : 0
      trackEvent('reading_generated', spreadAnalyticsPayload(this.spread, this.aktyvnyyTyp))
      await this.heneruvatyTlumachennya()
      await this.zberegtyRozkladUIstoriyu(this.spread, vyznachennya?.title ?? `Розклад на ${this.spread.length} карт`)
    } catch (err) {
      this.pomylka = err instanceof Error ? err.message : 'Сталася помилка'
    } finally {
      this.zavantazhennya = false
      this.onovytyDoshkuRozkladu()
    }
  }

  onovytyDoshkuRozkladu() {
    const doshka = this.znayty('spread-board')
    doshka.spread = this.spread
    doshka.activeDefinition = this.vyznachennyaRozkladiv.find((d) => d.id === this.aktyvnyyTyp)
    doshka.loading = this.zavantazhennya
    doshka.revealKey = this.klyuchVidkryttya
    doshka.boardPulse = this.pulsDoshky
    doshka.copyStatus = this.stanKopii
    doshka.shareLoading = this.zavantazhennyaPoshyrennya
    this.onovytyVybirRytualu()
  }

  onovytyPanelTlumachennya() {
    const panel = this.znayty('interpretation-panel')
    panel.hasSpread = Boolean(this.spread.length)
    panel.interpretation = this.tlumachennya
    panel.loading = this.zavantazhennyaTlumachennya
    panel.tone = this.tonTlumachennya
    panel.tones = this.tonyTlumachennya
  }

  async heneruvatyTlumachennya() {
    if (!this.spread.length) return
    this.zavantazhennyaTlumachennya = true
    this.onovytyPanelTlumachennya()

    try {
      this.tlumachennya = await fetchSpreadInterpretation(this.spread, this.aktyvnyyTyp, this.tonTlumachennya)
      trackEvent('ai_interpretation_generated', interpretationAnalyticsPayload({
        spread: this.spread,
        spreadType: this.aktyvnyyTyp,
        tone: this.tonTlumachennya,
        source: this.tlumachennya.provider,
      }))
    } catch (err) {
      this.pomylka = err instanceof Error ? err.message : 'Не вдалося згенерувати тлумачення'
    } finally {
      this.zavantazhennyaTlumachennya = false
      this.onovytyPanelTlumachennya()
    }
  }

  async vstanovytyTonTlumachennya(ton) {
    if (this.tonTlumachennya === ton) return
    this.tonTlumachennya = ton
    trackEvent('interpretation_tone_changed', { tone: ton })
    await this.heneruvatyTlumachennya()
  }

  synkhronizuvatySpysky() {
    this.istoriyaRozkladiv = loadJournal()
    this.obraniRozklady = loadFavorites()
    this.onovytySchodennyky()
  }

  onovytySchodennyky() {
    this.znayty('favorite-journal').items = this.obraniRozklady
    this.znayty('history-journal').items = this.istoriyaRozkladiv
  }

  async zberegtyRozkladUIstoriyu(karty, tytul) {
    if (!karty.length) return
    const zberezhenyy = addEntry({
      title: tytul,
      spreadType: this.aktyvnyyTyp,
      cards: karty,
      interpretation: this.tlumachennya,
      favorite: false
    })
    this.istoriyaRozkladiv.unshift(zberezhenyy)
    this.istoriyaRozkladiv = this.istoriyaRozkladiv.slice(0, 20)
    this.onovytySchodennyky()
  }

  async zberegtyObranyyRozklad() {
    if (!this.spread.length) return
    try {
      const def = this.vyznachennyaRozkladiv.find((d) => d.id === this.aktyvnyyTyp)
      const zberezhenyy = addEntry({
        title: def?.title ?? 'Обраний розклад',
        spreadType: this.aktyvnyyTyp,
        cards: this.spread,
        interpretation: this.tlumachennya,
        favorite: true
      })
      this.obraniRozklady.unshift(zberezhenyy)
      this.obraniRozklady = this.obraniRozklady.slice(0, 12)
      trackEvent('favorite_added', spreadAnalyticsPayload(this.spread, this.aktyvnyyTyp))
      this.stanKopii = 'Розклад додано в обране.'
    } catch (err) {
      this.stanKopii = err instanceof Error ? err.message : 'Не вдалося додати в обране.'
    }
    this.onovytyDoshkuRozkladu()
    this.onovytySchodennyky()
  }

  async vidkrytyZapysSchodennyka(zapis) {
    this.aktyvnyyTyp = zapis.spreadType
    this.spread = zapis.cards
    this.tlumachennya = zapis.interpretation
    this.selectorZghornuto = true
    this.rezultatPoshyrennya = null
    this.urlPereglyadu = ''
    this.stanKopii = 'Розклад відкрито з Книги розкладів.'
    trackEvent('journal_entry_opened', {
      id: zapis.id,
      spreadType: zapis.spreadType,
      favorite: zapis.favorite,
      cardsCount: zapis.cards.length
    })
    this.onovytyDoshkuRozkladu()
    this.onovytyPanelTlumachennya()
    this.onovytyPanelPoshyrennya()
    this.znayty('spread-board').scrollIntoView({ behavior: 'smooth' })
  }

  async zberegtyNotatkuSchodennyka(payload) {
    try {
      const onovlenyy = updateEntry(payload.id, { note: payload.note })
      if (onovlenyy) {
        this.istoriyaRozkladiv = loadJournal()
        this.obraniRozklady = loadFavorites()
        trackEvent('journal_note_saved', { id: payload.id, noteLength: payload.note.length })
        this.stanKopii = 'Нотатку збережено.'
      }
    } catch (err) {
      this.stanKopii = err instanceof Error ? err.message : 'Не вдалося зберегти нотатку.'
    }
    this.onovytyDoshkuRozkladu()
  }

  async poshyrytyPotochnyyRozklad() {
    if (!this.spread.length) return
    trackEvent('share_clicked', spreadAnalyticsPayload(this.spread, this.aktyvnyyTyp))
    this.zavantazhennyaPoshyrennya = true
    this.stanKopii = ''

    try {
      const def = this.vyznachennyaRozkladiv.find((d) => d.id === this.aktyvnyyTyp)
      const tytul = def?.title ?? 'Мій розклад Таро'
      const rezultat = await createShareableSpread({
        title: tytul,
        spreadType: this.aktyvnyyTyp,
        cards: this.spread,
        interpretation: this.tlumachennya
      })
      this.rezultatPoshyrennya = rezultat
      this.urlPereglyadu = await buildSharePreview(rezultat)
      trackEvent('share_link_created', {
        slug: rezultat.slug,
        ...spreadAnalyticsPayload(this.spread, this.aktyvnyyTyp)
      })
      this.stanKopii = 'Публічне посилання створено.'
    } catch (err) {
      this.stanKopii = err instanceof Error ? err.message : 'Не вдалося створити посилання для поширення.'
    } finally {
      this.zavantazhennyaPoshyrennya = false
      this.onovytyDoshkuRozkladu()
      this.onovytyPanelPoshyrennya()
    }
  }

  onovytyPanelPoshyrennya() {
    const panel = this.znayty('share-panel')
    panel.shareResult = this.rezultatPoshyrennya
    panel.previewUrl = this.urlPereglyadu
  }

  async kopiyuvatyURLPoshyrennya() {
    if (!this.rezultatPoshyrennya) return
    try {
      await navigator.clipboard.writeText(this.rezultatPoshyrennya.url)
      trackEvent('share_url_copied', { slug: this.rezultatPoshyrennya.slug })
      this.stanKopii = 'Посилання скопійовано.'
    } catch {
      this.stanKopii = 'Не вдалося скопіювати посилання автоматично.'
    }
    this.onovytyDoshkuRozkladu()
  }

  async systemnePoshyrennya() {
    if (!this.rezultatPoshyrennya) return
    const payload = {
      title: this.rezultatPoshyrennya.social.title,
      text: this.rezultatPoshyrennya.social.description,
      url: this.rezultatPoshyrennya.url
    }
    if (navigator.share) {
      await navigator.share(payload)
      trackEvent('native_share_completed', { slug: this.rezultatPoshyrennya.slug })
      return
    }
    await this.kopiyuvatyURLPoshyrennya()
  }

  async zavantazytyPeredglyadPoshyrennya(slah) {
    const poshyrenyy = await fetchSharedSpread(slah)
    this.peredglyadPoshyrennya = true
    this.aktyvnyyTyp = poshyrenyy.spreadType
    this.spread = poshyrenyy.cards
    this.tlumachennya = poshyrenyy.interpretation
    this.selectorZghornuto = true
    this.rezultatPoshyrennya = poshyrenyy
    this.urlPereglyadu = await buildSharePreview(poshyrenyy)
    this.stanKopii = 'Відкрито публічний розклад.'
    trackEvent('shared_spread_opened', {
      slah,
      spreadType: poshyrenyy.spreadType,
      cardsCount: poshyrenyy.cards.length
    })
    this.onovytyDoshkuRozkladu()
    this.onovytyPanelTlumachennya()
    this.onovytyPanelPoshyrennya()
  }

  async kopiyuvatyTekstRozkladu() {
    if (!this.spread.length) return
    const def = this.vyznachennyaRozkladiv.find((d) => d.id === this.aktyvnyyTyp)
    const tytul = def?.title ?? 'Розклад Таро'
    const tekst = [
      tytul,
      ...this.spread.map((item) => [
        `\n${item.position}: ${item.card.name}${item.reversed ? ' (перевернута)' : ''}`,
        item.positionDescription,
        `Ключові слова: ${item.card.keywords.join(', ')}`,
        `Значення: ${cardMeaning(item)}`
      ].join('\n'))
    ].join('\n')
    try {
      await navigator.clipboard.writeText(tekst)
      trackEvent('reading_text_copied', spreadAnalyticsPayload(this.spread, this.aktyvnyyTyp))
      this.stanKopii = 'Текст розкладу скопійовано.'
    } catch {
      this.stanKopii = 'Не вдалося скопіювати автоматично.'
    }
    this.onovytyDoshkuRozkladu()
  }
}

vyznachyty('tarot-board', TarotBoard)
