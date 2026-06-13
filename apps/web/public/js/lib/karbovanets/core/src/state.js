export function syhnal(pochatkove) {
  let znach = pochatkove
  const pidpysky = new Set()

  const chytaty = () => {
    if (syhnal._aktyvnyy) pidpysky.add(syhnal._aktyvnyy)
    return znach
  }

  chytaty.vstanovyty = (nastupne) => {
    if (typeof nastupne === 'function') nastupne = nastupne(znach)
    if (nastupne !== znach) {
      znach = nastupne
      for (const pidpyska of [...pidpysky]) pidpyska()
    }
  }

  chytaty.onovyty = (funk) => chytaty.vstanovyty(funk(znach))

  chytaty.pidpysatys = (funk) => {
    pidpysky.add(funk)
    return () => pidpysky.delete(funk)
  }

  return chytaty
}

syhnal._aktyvnyy = null

export function efekt(funk) {
  const zapustyty = () => {
    const poperednie = syhnal._aktyvnyy
    syhnal._aktyvnyy = zapustyty
    try { funk() }
    finally { syhnal._aktyvnyy = poperednie }
  }
  zapustyty()
  return () => {}
}

export function obchysleno(funk) {
  const s = syhnal()
  efekt(() => s.vstanovyty(funk()))
  return s
}

export function reaktywnyy(obiekt) {
  const syhnaly = {}

  for (const klyuch in obiekt) {
    syhnaly[klyuch] = syhnal(obiekt[klyuch])
  }

  return new Proxy(obiekt, {
    get(tsil, klyuch) {
      if (klyuch === '_syr') return tsil
      if (klyuch in syhnaly) return syhnaly[klyuch]()
      return tsil[klyuch]
    },
    set(tsil, klyuch, znach) {
      if (klyuch in syhnaly) {
        syhnaly[klyuch].vstanovyty(znach)
        return true
      }
      tsil[klyuch] = znach
      return true
    }
  })
}

export { syhnal as default }
