import { hryvnia } from './dollar.js'
import { Komponent, vyznachyty } from './component.js?v=2'
import { syhnal, reaktywnyy, efekt, obchysleno } from './state.js'

const k = Object.assign(hryvnia, {
  Komponent,
  vyznachyty,
  syhnal,
  reaktywnyy,
  efekt,
  obchysleno
})

export { Komponent, vyznachyty }

export default k
export { hryvnia }
