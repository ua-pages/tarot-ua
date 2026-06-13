import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'

export class LibraryPage extends Komponent {
  vyvesty() {
    return `
      <main class="quiet-page">
        <app-nav></app-nav>

        <section class="quiet-room" aria-labelledby="library-title">
          <p class="quiet-kicker">Бібліотека символів</p>
          <h1 id="library-title">Карти як мова для роздумів</h1>
          <p class="quiet-lead quiet-lead-narrow">
            Бібліотека поступово стане спокійним довідником: значення карт, образи, питання для саморефлексії
            та підказки для особистого щоденника.
          </p>

          <div class="quiet-actions">
            <a class="quiet-btn quiet-btn-primary" href="/session">Почати сесію</a>
            <a class="quiet-btn quiet-btn-ghost" href="/">На головну</a>
          </div>
        </section>
      </main>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.znaytyVsi('a').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault()
        window.navigateTo(a.getAttribute('href'))
      })
    })
  }
}

vyznachyty('library-page', LibraryPage)
