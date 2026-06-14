function rozibratyShablon(shablon) {
  const imena = []
  const rehvyraz = shablon.replace(/:([a-zA-Z_]+)/g, (_, imya) => {
    imena.push(imya)
    return '([^/]+)'
  })
  return {
    rehvyraz: new RegExp(`^${rehvyraz}$`),
    imena
  }
}

class Marshrutyzator {
  constructor(parametry = {}) {
    this._marshruty = []
    this._zapas = parametry.zapas || null
    this._osnova = parametry.osnova || ''
    this._potochnyy = { marshrut: null, param: {}, hesh: '' }

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => this._znayty())
    }
  }

  na(shablon, obrobnyk) {
    const povnyy = this._osnova + shablon
    const { rehvyraz, imena } = rozibratyShablon(povnyy)
    this._marshruty.push({ shablon, povnyy, rehvyraz, imena, obrobnyk })
    return this
  }

  zapas(obrobnyk) {
    this._zapas = obrobnyk
    return this
  }

  pochaty() {
    if (typeof window !== 'undefined') {
      if (!window.location.hash) {
        const shlyakh = window.location.pathname
        window.location.hash = this._osnova + (shlyakh !== '/' ? shlyakh : '/')
      }
      this._znayty()
    }
    return this
  }

  yty(shlyakh) {
    if (typeof window !== 'undefined') {
      window.location.hash = this._osnova + shlyakh
    }
    return this
  }

  get potochnyy() {
    return this._potochnyy
  }

  _znayty() {
    const hesh = window.location.hash.slice(1) || '/'
    const shlyakh = hesh.startsWith(this._osnova) ? hesh.slice(this._osnova.length) : hesh
    const ochyshchenyy = '/' + shlyakh.replace(/^\/+/, '').replace(/\/+$/, '') || '/'

    for (const marshrut of this._marshruty) {
      const spivpad = ochyshchenyy.match(marshrut.rehvyraz)
      if (spivpad) {
        const param = {}
        marshrut.imena.forEach((imya, i) => {
          param[imya] = decodeURIComponent(spivpad[i + 1])
        })
        this._potochnyy = { marshrut, param, hesh }
        marshrut.obrobnyk({ param, shlyakh: ochyshchenyy, hesh })
        return
      }
    }

    if (this._zapas) {
      this._potochnyy = { marshrut: null, param: {}, hesh }
      this._zapas({ shlyakh: ochyshchenyy, hesh })
    }
  }
}

export default Marshrutyzator
