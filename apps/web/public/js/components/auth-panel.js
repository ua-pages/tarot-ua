import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'

export class AuthPanel extends Komponent {
  constructor() {
    super()
    this._imya = localStorage.getItem('tarot-nickname') || ''
  }

  vyvesty() {
    return `
      <section class="panel auth-panel">
        <div id="auth-card" class="auth-card">
          <div>
            <p class="eyebrow">Профіль</p>
            <h2>Ваше ім'я</h2>
            <p class="muted">Як до вас звертатись? Ім'я зберігається локально.</p>
          </div>
          <div class="auth-grid">
            <input id="name-input" class="auth-input" placeholder="Нікнейм" maxlength="30" />
            <button id="save-btn" class="btn">Почати</button>
          </div>
        </div>
        <div id="auth-user" class="auth-user" style="display:none">
          <div>Привіт, <strong id="user-name"></strong></div>
          <button id="change-btn" class="btn btn-secondary">Змінити ім'я</button>
        </div>
      </section>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.onovlytyUI()

    this.znayty('save-btn').addEventListener('click', () => this.zberegtyImya())
    this.znayty('name-input').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') this.zberegtyImya()
    })
    this.znayty('change-btn').addEventListener('click', () => {
      localStorage.removeItem('tarot-nickname')
      this._imya = ''
      this.onovlytyUI()
      this.vyslaty('name-changed', { name: '' })
    })
  }

  zberegtyImya() {
    const input = this.znayty('name-input')
    const imya = input.value.trim()
    if (!imya) return
    localStorage.setItem('tarot-nickname', imya)
    this._imya = imya
    this.onovlytyUI()
    this.vyslaty('name-changed', { name: imya })
  }

  onovlytyUI() {
    const karta = this.znayty('auth-card')
    const korystuvach = this.znayty('auth-user')

    if (this._imya) {
      karta.style.display = 'none'
      korystuvach.style.display = 'flex'
      this.znayty('user-name').textContent = this._imya
    } else {
      karta.style.display = 'block'
      korystuvach.style.display = 'none'
      this.znayty('name-input').value = ''
      this.znayty('name-input').focus()
    }
  }
}

vyznachyty('auth-panel', AuthPanel)
