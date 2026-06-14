let _ident = 0

export class Komponent extends HTMLElement {
  static atrybuty = []
  static get observedAttributes() { return this.atrybuty }

  constructor(opts = {}) {
    super()
    this._uid = ++_ident
    this._podyi = []
    this._stan = {}
    this._tin = opts.tin !== false
      ? this.attachShadow({ mode: opts.rezhymTini || 'open' })
      : null
  }

  get stan() {
    return this._stan
  }

  vstanovytyStan(частковий) {
    const poperednie = { ...this._stan }
    Object.assign(this._stan, частковий)
    this._latka()
    if (this.onovleno) this.onovleno(this._stan, poperednie)
  }

  atrybut(imya, fallback = null) {
    const v = this.getAttribute(imya)
    return v !== null ? v : fallback
  }

  boolAtrybut(imya) {
    return this.hasAttribute(imya)
  }

  atribut(imya, znach) {
    if (znach === undefined) return this.getAttribute(imya)
    if (znach === null || znach === false) this.removeAttribute(imya)
    else this.setAttribute(imya, znach)
    return this
  }

  vidbyty(imya, znach) {
    if (znach === undefined) return this._stan[imya]
    this.vstanovytyStan({ [imya]: znach })
    const atrib = this.constructor.atrybuty?.includes(imya) ? imya : null
    if (atrib) {
      if (znach === null || znach === undefined || znach === false) this.removeAttribute(atrib)
      else this.setAttribute(atrib, znach)
    }
    return this
  }

  attributeChangedCallback(imya, stare, nove) {
    if (stare === nove) return
    this._stan[imya] = nove !== null ? nove : undefined
    this._latka()
    if (this.onovleno) this.onovleno(this._stan, {})
  }

  connectedCallback() {
    if (this.pochaty) this.pochaty()
    this._latka()
    if (this.prykripleno) Promise.resolve().then(() => this.prykripleno())
  }

  disconnectedCallback() {
    for (const [el, ev, fn] of this._podyi) {
      el.removeEventListener(ev, fn)
    }
    this._podyi = []
    if (this.vidkripleno) this.vidkripleno()
  }

  adoptedCallback() {
    if (this.pryynyato) this.pryynyato()
  }

  na(el, ev, fn, opts) {
    el.addEventListener(ev, fn, opts)
    this._podyi.push([el, ev, fn])
  }

  znayty(sel) {
    const s = (!sel.includes(' ') && !sel.startsWith('#') && !sel.startsWith('.') && !sel.startsWith('[') && !customElements.get(sel)) ? `#${sel}` : sel
    return (this._tin || this).querySelector(s)
  }

  znaytyVsi(sel) {
    const s = (!sel.includes(' ') && !sel.startsWith('#') && !sel.startsWith('.') && !sel.startsWith('[') && !customElements.get(sel)) ? `#${sel}` : sel
    return (this._tin || this).querySelectorAll(s)
  }

  vyslaty(imya, detal) {
    this.dispatchEvent(new CustomEvent(imya, { detail: detal, bubbles: true, composed: true }))
  }

  _latka() {
    if (!this.vyvesty) return
    const html = this.vyvesty()
    if (this._tin) this._tin.innerHTML = html
    else this.innerHTML = html
  }
}

export function vyznachyty(imya, klas) {
  const teh = imya || klas.name?.replace(/([a-z])([A-Z])/g, '$1-$').toLowerCase()
  if (!customElements.get(teh)) customElements.define(teh, klas)
  return teh
}

export { Komponent as default }
