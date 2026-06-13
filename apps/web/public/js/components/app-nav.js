import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'

export class AppNav extends Komponent {
  vyvesty() {
    return `
      <nav class="quiet-nav" aria-label="Основна навігація">
        <a class="quiet-brand" href="/" aria-label="На головну">
          <span class="quiet-brand-mark" aria-hidden="true">✦</span>
          <span>Tarot UA</span>
        </a>
        <div class="quiet-nav-links">
          <a href="/fast-session">Мить</a>
          <a href="/session">Сесія</a>
          <a href="/journal">Щоденник</a>
          <a href="/library">Карти</a>
        </div>
      </nav>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
  }
}

vyznachyty('app-nav', AppNav)
