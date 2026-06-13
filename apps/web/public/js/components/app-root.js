import { initAnalytics, trackEvent } from '../analytics/analytics.js'
import { refreshFeatureFlags } from '../analytics/use-features.js'
import { Marshrutyzator } from '../lib/karbovanets/gazda/src/index.js'

import '../components/app-nav.js'
import '../components/auth-panel.js'
import '../components/ritual-selector.js'
import '../components/card-of-day-panel.js'
import '../components/deck-panel.js'
import '../components/interpretation-panel.js'
import '../components/share-panel.js'
import '../components/spread-board.js'
import '../components/tarot-journal.js'
import '../components/stored-spreads-list.js'
import '../components/tarot-board.js'
import '../components/fast-session.js'
import '../components/home-page.js'
import '../components/journal-page.js'
import '../components/library-page.js'
import '../components/seo-card-page.js'
import '../components/seo-spread-page.js'

const router = new Marshrutyzator()

function vyvestyStorinku(teh, param) {
  const vyvod = document.getElementById('outlet')
  vyvod.innerHTML = ''
  let element
  switch (teh) {
    case 'meaning':
      element = document.createElement('seo-card-page')
      element.setAttribute('slug', param.slug)
      break
    case 'spread':
      element = document.createElement('seo-spread-page')
      element.setAttribute('slug', param.slug)
      break
    case 'session':
      element = document.createElement('tarot-board')
      break
    case 'fast-session':
      element = document.createElement('fast-session')
      break
    case 'journal':
      element = document.createElement('journal-page')
      break
    case 'library':
      element = document.createElement('library-page')
      break
    default:
      element = document.createElement('home-page')
  }
  vyvod.appendChild(element)
}

router.na('/', ({ param }) => vyvestyStorinku('home'))
router.na('/session', ({ param }) => vyvestyStorinku('session'))
router.na('/fast-session', ({ param }) => vyvestyStorinku('fast-session'))
router.na('/journal', ({ param }) => vyvestyStorinku('journal'))
router.na('/library', ({ param }) => vyvestyStorinku('library'))
router.na('/meaning/:slug', ({ param }) => vyvestyStorinku('meaning', param))
router.na('/spreads/:slug', ({ param }) => vyvestyStorinku('spread', param))
router.na('/share/:slug', ({ param }) => vyvestyStorinku('session'))

router.zapas(() => vyvestyStorinku('home'))

window.navigateTo = (shlyakh) => router.yty(shlyakh)

document.addEventListener('DOMContentLoaded', () => {
  router.pochaty()
  initAnalytics()
  refreshFeatureFlags()
  document.body.appendChild(stvorytySvitinnyaKursora())
})

function stvorytySvitinnyaKursora() {
  const svitinnya = document.createElement('div')
  svitinnya.className = 'mystic-cursor-glow'
  svitinnya.style.display = 'none'

  let tajmer
  document.addEventListener('mousemove', (e) => {
    svitinnya.style.display = ''
    svitinnya.style.left = `${e.clientX}px`
    svitinnya.style.top = `${e.clientY}px`
    clearTimeout(tajmer)
    tajmer = setTimeout(() => { svitinnya.style.display = 'none' }, 3000)
  })

  return svitinnya
}
