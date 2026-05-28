import { computed, nextTick, ref, type Ref } from 'vue'
import { buildSharePreview } from '../sharePreview'
import { cardMeaning } from '../utils'
import { interpretationAnalyticsPayload, spreadAnalyticsPayload, trackEvent } from '../analytics/useAnalytics'
import { INTERPRETATION_TONES } from '../constants/interpretation'
import { useFeatures } from '../analytics/useFeatures'
import {
  createShareableSpread, drawSpread, fetchCardOfDay,
  fetchCards, fetchCloudSpreads, fetchSharedSpread,
  fetchSpreadDefinitions, fetchSpreadInterpretation,
  saveCloudSpread, updateCloudSpreadNote
} from '../services/api'
import type { AuthUser, CloudSpread, DrawnCard, InterpretationTone, SharedSpread, SpreadDefinition, SpreadInterpretation, SpreadType, TarotCard } from '../types'

export function useTarotSession(currentUser: Ref<AuthUser | null>) {
  const cards = ref<TarotCard[]>([])
  const showDeck = ref(false)
  const deckLoading = ref(false)
  const spread = ref<DrawnCard[]>([])
  const spreadDefinitions = ref<SpreadDefinition[]>([])
  const activeSpreadType = ref<SpreadType>('classic3')
  const cardOfDay = ref<DrawnCard | null>(null)
  const loading = ref(false)
  const revealKey = ref(0)
  const error = ref('')
  const copyStatus = ref('')
  const interpretation = ref<SpreadInterpretation | null>(null)
  const interpretationLoading = ref(false)
  const interpretationTone = ref<InterpretationTone>('psychological')
  const ritualSection = ref<HTMLElement | null>(null)
  const boardSection = ref<HTMLElement | null>(null)
  const selectorCollapsed = ref(false)
  const boardPulse = ref(false)
  const spreadHistory = ref<CloudSpread[]>([])
  const favoriteSpreads = ref<CloudSpread[]>([])
  const shareResult = ref<SharedSpread | null>(null)
  const sharePreviewUrl = ref('')
  const shareLoading = ref(false)
  const isSharedView = ref(false)
  const { flags } = useFeatures()

  const activeSpreadDefinition = computed(() => spreadDefinitions.value.find((item) => item.id === activeSpreadType.value))

  const todayLabel = new Intl.DateTimeFormat('uk-UA', {
    dateStyle: 'full'
  }).format(new Date())

  const interpretationTones = INTERPRETATION_TONES

  function delay(ms: number) {
    return new Promise((resolve) => window.setTimeout(resolve, ms))
  }

  function scrollToRitual() {
    trackEvent('ritual_start_clicked')
    ritualSection.value?.scrollIntoView()
  }

  async function chooseSpread(type: SpreadType) {
    trackEvent('spread_selected', { spreadType: type })
    selectorCollapsed.value = true
    await refreshSpread(type)
    await nextTick()
    boardSection.value?.scrollIntoView()
    boardPulse.value = true
    window.setTimeout(() => {
      boardPulse.value = false
    }, 1100)
  }

  async function loadCards() {
    if (cards.value.length || deckLoading.value) return

    deckLoading.value = true
    try {
      cards.value = await fetchCards(78)
    } finally {
      deckLoading.value = false
    }
  }

  async function toggleDeck() {
    showDeck.value = !showDeck.value
    trackEvent('deck_toggled', { expanded: showDeck.value })
    if (showDeck.value) {
      await loadCards()
    }
  }

  async function loadSpreadDefinitions() {
    spreadDefinitions.value = await fetchSpreadDefinitions()
  }

  function setPlaceholderImage(event: Event) {
    const image = event.target as HTMLImageElement
    if (image.src.endsWith('/cards/tarot-placeholder.svg')) return
    image.src = '/cards/tarot-placeholder.svg'
  }

  async function loadCardOfDay() {
    cardOfDay.value = await fetchCardOfDay()
    trackEvent('daily_card_opened', {
      cardId: cardOfDay.value.card.id,
      reversed: cardOfDay.value.reversed
    })
  }

  async function refreshSpread(type: SpreadType = activeSpreadType.value) {
    interpretation.value = null
    const definition = spreadDefinitions.value.find((item) => item.id === type)
    activeSpreadType.value = type
    loading.value = true
    error.value = ''
    copyStatus.value = ''
    shareResult.value = null
    sharePreviewUrl.value = ''

    try {
      const [drawnCards] = await Promise.all([
        drawSpread(definition?.count ?? 3, type),
        delay(520)
      ])
      spread.value = drawnCards
      revealKey.value += flags.value.enhancedReveal ? 1 : 0
      trackEvent('reading_generated', spreadAnalyticsPayload(spread.value, activeSpreadType.value))
      await generateInterpretation()
      await saveSpreadToHistory(spread.value, definition?.title ?? `Розклад на ${spread.value.length} карт`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Сталася помилка'
    } finally {
      loading.value = false
    }
  }

  async function generateInterpretation() {
    if (!spread.value.length) return

    interpretationLoading.value = true

    try {
      interpretation.value = await fetchSpreadInterpretation(spread.value, activeSpreadType.value, interpretationTone.value)
      trackEvent('ai_interpretation_generated', interpretationAnalyticsPayload({
        spread: spread.value,
        spreadType: activeSpreadType.value,
        tone: interpretationTone.value,
        source: interpretation.value.provider,
      }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Не вдалося згенерувати тлумачення'
    } finally {
      interpretationLoading.value = false
    }
  }

  function trackPremiumPreviewClick() {
    trackEvent('premium_preview_clicked', {
      spreadType: activeSpreadType.value,
      hasSpread: Boolean(spread.value.length)
    })
  }

  async function setInterpretationTone(tone: InterpretationTone) {
    if (interpretationTone.value === tone) return

    interpretationTone.value = tone
    trackEvent('interpretation_tone_changed', { tone })
    await generateInterpretation()
  }

  async function syncUserLists() {
    if (!currentUser.value) {
      spreadHistory.value = []
      favoriteSpreads.value = []
      return
    }

    const [history, favorites] = await Promise.all([
      fetchCloudSpreads(),
      fetchCloudSpreads(true)
    ])

    spreadHistory.value = history
    favoriteSpreads.value = favorites
  }

  async function saveSpreadToHistory(cards: DrawnCard[], title: string) {
    if (!currentUser.value || !cards.length) return

    const saved = await saveCloudSpread({
      title,
      spreadType: activeSpreadType.value,
      cards,
      interpretation: interpretation.value,
      favorite: false
    })

    spreadHistory.value.unshift(saved)
    spreadHistory.value = spreadHistory.value.slice(0, 20)
  }

  async function saveFavoriteSpread() {
    if (!currentUser.value) {
      copyStatus.value = 'Спочатку увійди, щоб зберігати обрані розклади.'
      return
    }

    if (!spread.value.length) return

    try {
      const saved = await saveCloudSpread({
        title: activeSpreadDefinition.value?.title ?? 'Обраний розклад',
        spreadType: activeSpreadType.value,
        cards: spread.value,
        interpretation: interpretation.value,
        favorite: true
      })

      favoriteSpreads.value.unshift(saved)
      favoriteSpreads.value = favoriteSpreads.value.slice(0, 12)
      trackEvent('favorite_added', spreadAnalyticsPayload(spread.value, activeSpreadType.value))
      copyStatus.value = 'Розклад додано в обране.'
    } catch (err) {
      copyStatus.value = err instanceof Error ? err.message : 'Не вдалося додати в обране.'
    }
  }

  async function openJournalEntry(entry: CloudSpread) {
    activeSpreadType.value = entry.spreadType
    spread.value = entry.cards
    interpretation.value = entry.interpretation
    selectorCollapsed.value = true
    shareResult.value = null
    sharePreviewUrl.value = ''
    copyStatus.value = 'Розклад відкрито з Книги розкладів.'
    trackEvent('journal_entry_opened', {
      id: entry.id,
      spreadType: entry.spreadType,
      favorite: entry.favorite,
      cardsCount: entry.cards.length
    })
    await nextTick()
    boardSection.value?.scrollIntoView()
  }

  async function saveJournalNote(payload: { id: string; note: string }) {
    try {
      const updated = await updateCloudSpreadNote(payload.id, payload.note)
      spreadHistory.value = spreadHistory.value.map((item) => item.id === updated.id ? updated : item)
      favoriteSpreads.value = favoriteSpreads.value.map((item) => item.id === updated.id ? updated : item)
      trackEvent('journal_note_saved', { id: payload.id, noteLength: payload.note.length })
      copyStatus.value = 'Нотатку збережено.'
    } catch (err) {
      copyStatus.value = err instanceof Error ? err.message : 'Не вдалося зберегти нотатку.'
    }
  }

  async function shareCurrentSpread() {
    if (!spread.value.length) return

    trackEvent('share_clicked', spreadAnalyticsPayload(spread.value, activeSpreadType.value))

    shareLoading.value = true
    copyStatus.value = ''

    try {
      const title = activeSpreadDefinition.value?.title ?? 'Мій розклад Таро'
      const result = await createShareableSpread({
        title,
        spreadType: activeSpreadType.value,
        cards: spread.value,
        interpretation: interpretation.value
      })

      shareResult.value = result
      sharePreviewUrl.value = await buildSharePreview(result)
      trackEvent('share_link_created', {
        slug: result.slug,
        ...spreadAnalyticsPayload(spread.value, activeSpreadType.value)
      })
      copyStatus.value = 'Публічне посилання створено.'
    } catch (err) {
      copyStatus.value = err instanceof Error ? err.message : 'Не вдалося створити share-link.'
    } finally {
      shareLoading.value = false
    }
  }

  async function copyShareUrl() {
    if (!shareResult.value) return

    try {
      await navigator.clipboard.writeText(shareResult.value.url)
      trackEvent('share_url_copied', { slug: shareResult.value.slug })
      copyStatus.value = 'Посилання скопійовано.'
    } catch {
      copyStatus.value = 'Не вдалося скопіювати посилання автоматично.'
    }
  }

  function selectShareUrl(event: Event) {
    (event.target as HTMLInputElement).select()
  }

  async function nativeShare() {
    if (!shareResult.value) return

    const payload = {
      title: shareResult.value.social.title,
      text: shareResult.value.social.description,
      url: shareResult.value.url
    }

    if (navigator.share) {
      await navigator.share(payload)
      trackEvent('native_share_completed', { slug: shareResult.value.slug })
      return
    }

    await copyShareUrl()
  }

  async function loadSharedView(slug: string) {
    const shared = await fetchSharedSpread(slug)
    isSharedView.value = true
    activeSpreadType.value = shared.spreadType
    spread.value = shared.cards
    interpretation.value = shared.interpretation
    selectorCollapsed.value = true
    shareResult.value = shared
    sharePreviewUrl.value = await buildSharePreview(shared)
    copyStatus.value = 'Відкрито публічний розклад.'
    trackEvent('shared_spread_opened', {
      slug,
      spreadType: shared.spreadType,
      cardsCount: shared.cards.length
    })
  }

  async function copySpreadText() {
    if (!spread.value.length) return

    const title = activeSpreadDefinition.value?.title ?? 'Розклад Таро'
    const text = [
      title,
      ...spread.value.map((item) => [
        `\n${item.position}: ${item.card.name}${item.reversed ? ' (перевернута)' : ''}`,
        item.positionDescription,
        `Ключові слова: ${item.card.keywords.join(', ')}`,
        `Значення: ${cardMeaning(item)}`
      ].join('\n'))
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      trackEvent('reading_text_copied', spreadAnalyticsPayload(spread.value, activeSpreadType.value))
      copyStatus.value = 'Текст розкладу скопійовано.'
    } catch {
      copyStatus.value = 'Не вдалося скопіювати автоматично.'
    }
  }

  return {
    cards,
    showDeck,
    deckLoading,
    spread,
    spreadDefinitions,
    activeSpreadType,
    cardOfDay,
    loading,
    revealKey,
    error,
    copyStatus,
    interpretation,
    interpretationLoading,
    interpretationTone,
    ritualSection,
    boardSection,
    selectorCollapsed,
    boardPulse,
    spreadHistory,
    favoriteSpreads,
    shareResult,
    sharePreviewUrl,
    shareLoading,
    isSharedView,
    flags,
    activeSpreadDefinition,
    todayLabel,
    interpretationTones,
    scrollToRitual,
    chooseSpread,
    loadCardOfDay,
    loadSpreadDefinitions,
    toggleDeck,
    setPlaceholderImage,
    refreshSpread,
    generateInterpretation,
    trackPremiumPreviewClick,
    setInterpretationTone,
    syncUserLists,
    saveFavoriteSpread,
    openJournalEntry,
    saveJournalNote,
    shareCurrentSpread,
    copyShareUrl,
    selectShareUrl,
    nativeShare,
    loadSharedView,
    copySpreadText,
  }
}
