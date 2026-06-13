import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'
import { saveNickname } from '../services/session-storage.js'

export class HomePage extends Komponent {
  vyvesty() {
    return `
      <main class="quiet-page quiet-home">
        <app-nav></app-nav>

        <section class="quiet-hero" aria-labelledby="home-title">
          <p class="quiet-kicker">Простір для тихих роздумів</p>
          <h1 id="home-title">Що зараз у вас всередині?</h1>
          <p class="quiet-lead">
            Іноді достатньо зупинитись на кілька хвилин, щоб краще почути себе.
            Карти, нотатки та м'які ШІ-рефлексії допоможуть сповільнитись і подивитись на свій стан уважніше.
          </p>

          <form class="quiet-nickname-form" id="nickname-form">
            <label for="nickname-input" class="quiet-nickname-label">Як до вас звертатись?</label>
            <div class="quiet-nickname-row">
              <input type="text" id="nickname-input" class="quiet-nickname-input"
                placeholder="Нікнейм" maxlength="30" autocomplete="off" required>
              <button type="submit" class="quiet-btn quiet-btn-primary">Почати сесію</button>
            </div>
          </form>

          <div class="quiet-actions">
            <a class="quiet-btn quiet-btn-ghost" href="/session">Повільна сесія</a>
            <a class="quiet-btn quiet-btn-ghost" href="/journal">Відкрити щоденник</a>
          </div>
        </section>

        <section class="quiet-intro-grid" aria-label="Що тут можна зробити">
          <article class="quiet-card">
            <span class="quiet-card-icon" aria-hidden="true">☾</span>
            <h2>Сповільнитись</h2>
            <p>Зробити невелику паузу, сформулювати думку і повернути увагу до себе.</p>
          </article>

          <article class="quiet-card">
            <span class="quiet-card-icon" aria-hidden="true">✧</span>
            <h2>Подивитись уважніше</h2>
            <p>Карти працюють як символи: не дають готових відповідей, а допомагають побачити внутрішній стан.</p>
          </article>

          <article class="quiet-card">
            <span class="quiet-card-icon" aria-hidden="true">✍</span>
            <h2>Зберегти думки</h2>
            <p>Кожна сесія може стати записом у щоденнику, до якого можна повернутись пізніше.</p>
          </article>
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
    const forma = this.znayty('nickname-form')
    forma.addEventListener('submit', (e) => {
      e.preventDefault()
      const input = this.znayty('nickname-input')
      const imya = input.value.trim()
      if (!imya) return
      saveNickname(imya)
      window.navigateTo('/fast-session')
    })
  }
}

vyznachyty('home-page', HomePage)
