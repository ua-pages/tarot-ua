import { Komponent, vyznachyty } from '../lib/karbovanets/core/src/index.js'
import { adoptStyles } from '../shared-styles.js'

export class SharePanel extends Komponent {
  constructor() {
    super()
    this._rezultatPoshyrennya = null
    this._urlPereglyadu = ''
  }

  vyvesty() {
    return `
      <aside id="share-result" class="share-result" aria-live="polite" style="display:none">
        <div class="share-copy">
          <p class="eyebrow">Публічний розклад</p>
          <h3>Готово до поширення</h3>
          <p class="muted">Створено коротке посилання, картку для соцмереж і зображення для попереднього перегляду.</p>
          <div class="share-url-row">
            <input id="share-url" class="share-url" readonly />
            <button id="copy-url-btn" class="btn btn-secondary">Копіювати URL</button>
          </div>
          <div class="share-actions">
            <button id="native-share-btn" class="btn btn-ghost">Системно поділитись</button>
            <a id="download-link" class="btn btn-ghost share-download" download="tarot-spread.png" style="display:none">Завантажити PNG</a>
            <a id="social-link" class="btn btn-ghost share-download" target="_blank" rel="noreferrer" style="display:none">Картка для соцмереж (SVG)</a>
          </div>
        </div>
        <img id="preview-img" class="share-preview" src="" alt="Попередній перегляд розкладу для поширення" style="display:none" />
      </aside>
    `
  }

  async prykripleno() {
    await adoptStyles(this)
    this.znayty('copy-url-btn').addEventListener('click', () => this.vyslaty('copy-url'))
    this.znayty('native-share-btn').addEventListener('click', () => this.vyslaty('native-share'))
    this.znayty('share-url').addEventListener('focus', (e) => this.vyslaty('select-url', e))
  }

  set shareResult(val) {
    this._rezultatPoshyrennya = val
    const konteyner = this.znayty('share-result')
    const urlInput = this.znayty('share-url')
    const socialLink = this.znayty('social-link')

    if (val) {
      konteyner.style.display = 'grid'
      urlInput.value = val.url
      socialLink.style.display = ''
      socialLink.href = val.social.imageUrl
    } else {
      konteyner.style.display = 'none'
    }
  }

  set previewUrl(val) {
    this._urlPereglyadu = val
    const img = this.znayty('preview-img')
    const downloadLink = this.znayty('download-link')
    if (val) {
      img.style.display = ''
      img.src = val
      downloadLink.style.display = ''
      downloadLink.href = val
    } else {
      img.style.display = 'none'
      downloadLink.style.display = 'none'
    }
  }
}

vyznachyty('share-panel', SharePanel)
