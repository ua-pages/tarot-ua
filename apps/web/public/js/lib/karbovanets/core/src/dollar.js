function oberty(vuzol) {
  if (!vuzol) return null

  const ob = {
    get vuzol() { return vuzol },
    get isnuye() { return !!vuzol },

    zapovnyty(html) {
      if (html === undefined) return vuzol.innerHTML
      vuzol.innerHTML = html; return ob
    },
    slova(tekst) {
      if (tekst === undefined) return vuzol.textContent
      vuzol.textContent = tekst; return ob
    },
    vyd() {
      vuzol.style.display = ''
      return ob
    },
    nevyd() {
      vuzol.style.display = 'none'
      return ob
    },
    vbrannya(vlastyvosti) {
      if (typeof vlastyvosti === 'string') return getComputedStyle(vuzol)[vlastyvosti]
      if (typeof vlastyvosti === 'object') {
        for (const k in vlastyvosti) vuzol.style[k] = vlastyvosti[k]
      }
      return ob
    },
    oznaka(imya, znach) {
      if (znach === undefined) return vuzol.getAttribute(imya)
      vuzol.setAttribute(imya, znach); return ob
    },
    vdiah(klas) {
      vuzol.classList.add(klas); return ob
    },
    zdyah(klas) {
      vuzol.classList.remove(klas); return ob
    },
    perevdiah(klas) {
      vuzol.classList.toggle(klas); return ob
    },
    na(podiya, obrobnyk, opts) {
      vuzol.addEventListener(podiya, obrobnyk, opts); return ob
    },
    ny(podiya, obrobnyk) {
      vuzol.removeEventListener(podiya, obrobnyk); return ob
    },
    get znachennya() {
      return vuzol.value
    },
    set znachennya(val) {
      vuzol.value = val
    },
    prypysaty(...dity) {
      vuzol.append(...dity); return ob
    },
    dopysaty(...dity) {
      vuzol.prepend(...dity); return ob
    },
    het() {
      vuzol.remove(); return ob
    },
    dity() {
      const elementy = []
      for (const dytyna of vuzol.children) elementy.push(oberty(dytyna))
      return elementy
    },
    bazhko() {
      return vuzol.parentElement ? oberty(vuzol.parentElement) : null
    },
    dohory(sel) {
      let el = vuzol
      const elementy = []
      while (el.parentElement) {
        el = el.parentElement
        if (!sel || el.matches(sel)) elementy.push(oberty(el))
      }
      return elementy
    },
    braty() {
      const p = vuzol.parentElement
      if (!p) return []
      const elementy = []
      for (const dytyna of p.children) {
        if (dytyna !== vuzol) elementy.push(oberty(dytyna))
      }
      return elementy
    },
    znayty(sel) {
      const znaydeni = vuzol.querySelectorAll(sel)
      const elementy = []
      for (const el of znaydeni) elementy.push(oberty(el))
      return elementy
    },
    kozhnyi(funk) {
      funk(ob, 0); return ob
    }
  }

  return ob
}

function hryvnia(selektor, batko) {
  if (typeof selektor === 'string') {
    const kontekst = batko || document
    if (/^[#.a-zA-Z]/.test(selektor) && !selektor.includes(' ')) {
      const el = kontekst.querySelector(selektor)
      return el ? oberty(el) : null
    }
    const spysok = kontekst.querySelectorAll(selektor)
    if (spysok.length === 0) return null
    if (spysok.length === 1) return oberty(spysok[0])
    return Array.from(spysok).map(el => oberty(el))
  }
  if (selektor instanceof Node) return oberty(selektor)
  if (selektor instanceof NodeList || Array.isArray(selektor)) {
    const elementy = Array.from(selektor).map(el => oberty(el))
    return elementy.length === 1 ? elementy[0] : elementy
  }
  return null
}

hryvnia.stvoryty = (teh, vlastyvosti, ...dity) => {
  const el = document.createElement(teh)
  if (vlastyvosti) {
    for (const k in vlastyvosti) {
      if (k.startsWith('on')) {
        el.addEventListener(k.slice(2).toLowerCase(), vlastyvosti[k])
      } else if (k === 'class' || k === 'className') {
        el.className = vlastyvosti[k]
      } else {
        el.setAttribute(k, vlastyvosti[k])
      }
    }
  }
  for (const dytyna of dity) {
    if (typeof dytyna === 'string') el.appendChild(document.createTextNode(dytyna))
    else if (dytyna instanceof Node) el.appendChild(dytyna)
  }
  return oberty(el)
}

hryvnia.hotovyy = (funk) => {
  if (document.readyState !== 'loading') funk()
  else document.addEventListener('DOMContentLoaded', funk)
}

export { hryvnia }
export default hryvnia
