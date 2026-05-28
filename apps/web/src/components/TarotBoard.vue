<template>
  <main class="page session-page">
    <div class="ambient-orb orb-one" aria-hidden="true"></div>
    <div class="ambient-orb orb-two" aria-hidden="true"></div>

    <header class="hero hero-ritual" :class="{ 'hero-v2': flags.mysticHeroV2 }">
      <div class="hero-top">
        <a class="quiet-back-link" href="/">← На головну</a>
        <p class="eyebrow">Тиха сесія</p>
      </div>
      <h1>Почніть з того, що є всередині</h1>
      <p class="subtitle">Сформулюйте думку, яка зараз не відпускає. Оберіть практику — і дозвольте картам стати приводом для спокійної саморефлексії.</p>
      <div class="hero-actions">
        <button class="btn btn-large" type="button" @click="scrollToRitual">Зосередитись і обрати практику</button>
        <span class="hero-hint">пауза · символи · м’яка рефлексія · нотатки</span>
      </div>
    </header>

    <AuthPanel
      v-model:form="authForm"
      :user="currentUser"
      :mode="authMode"
      :loading="authLoading"
      @submit="handleSubmitAuth"
      @toggle-mode="toggleAuthMode"
      @logout="handleLogout"
    />

    <RitualSelector
      ref="ritualSection"
      :definitions="spreadDefinitions"
      :active-type="activeSpreadType"
      :collapsed="selectorCollapsed"
      :loading="loading"
      @choose="chooseSpread"
      @expand="selectorCollapsed = false"
    />

    <CardOfDayPanel
      :card="cardOfDay"
      :today-label="todayLabel"
      :error="error"
      @image-error="setPlaceholderImage"
    />

    <SpreadBoard
      ref="boardSection"
      :spread="spread"
      :active-definition="activeSpreadDefinition"
      :loading="loading"
      :reveal-key="revealKey"
      :board-pulse="boardPulse"
      :copy-status="copyStatus"
      :share-loading="shareLoading"
      @favorite="saveFavoriteSpread"
      @copy="copySpreadText"
      @share="shareCurrentSpread"
      @image-error="setPlaceholderImage"
    />

    <SharePanel
      :share-result="shareResult"
      :preview-url="sharePreviewUrl"
      @copy-url="copyShareUrl"
      @native-share="nativeShare"
      @select-url="selectShareUrl"
    />

    <section v-if="flags.premiumPreview" class="panel premium-preview-panel">
      <p class="eyebrow">Premium preview</p>
      <h2>Глибше AI-тлумачення</h2>
      <p class="muted">Тут можна тестувати м’який upsell: розширений аналіз, персональні висновки, додаткові тони і довшу історію.</p>
      <button class="btn btn-secondary" type="button" @click="trackPremiumPreviewClick">Подивитись можливості</button>
    </section>

    <InterpretationPanel
      :has-spread="Boolean(spread.length)"
      :interpretation="interpretation"
      :loading="interpretationLoading"
      :tone="interpretationTone"
      :tones="interpretationTones"
      @set-tone="setInterpretationTone"
    />

    <TarotJournal
      title="Книга розкладів"
      :items="favoriteSpreads"
      @open="openJournalEntry"
      @save-note="saveJournalNote"
      @image-error="setPlaceholderImage"
    />
    <TarotJournal
      title="Історія розкладів"
      :items="spreadHistory"
      @open="openJournalEntry"
      @save-note="saveJournalNote"
      @image-error="setPlaceholderImage"
    />

    <DeckPanel
      :cards="cards"
      :show-deck="showDeck"
      :loading="deckLoading"
      @toggle="toggleDeck"
      @image-error="setPlaceholderImage"
    />
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import AuthPanel from './AuthPanel.vue';
import CardOfDayPanel from './CardOfDayPanel.vue';
import DeckPanel from './DeckPanel.vue';
import InterpretationPanel from './InterpretationPanel.vue';
import RitualSelector from './RitualSelector.vue';
import SharePanel from './SharePanel.vue';
import SpreadBoard from './SpreadBoard.vue';
import TarotJournal from './TarotJournal.vue';
import { useAuth } from '../composables/useAuth';
import { useTarotSession } from '../composables/useTarotSession';
import { trackEvent } from '../analytics/useAnalytics';
import '../styles/tarot-board.css';

const auth = useAuth();
const {
  currentUser,
  authMode,
  authLoading,
  authForm,
} = auth;
const {
  submitAuth: authSubmit,
  logout: authLogout,
  toggleAuthMode,
  restoreSession,
} = auth;

const session = useTarotSession(currentUser);
const {
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
  trackPremiumPreviewClick,
} = session;

async function handleSubmitAuth() {
  const ok = await authSubmit();
  if (ok && currentUser.value) {
    await syncUserLists();
  }
}

function handleLogout() {
  authLogout();
  spreadHistory.value = [];
  favoriteSpreads.value = [];
}

onMounted(async () => {
  trackEvent('app_opened', {});

  try {
    await restoreSession();

    if (currentUser.value) {
      await syncUserLists();
    }

    await Promise.all([loadCardOfDay(), loadSpreadDefinitions()]);

    const sharedMatch = window.location.pathname.match(/^\/share\/([A-Za-z0-9_-]+)/);
    if (sharedMatch?.[1]) {
      await loadSharedView(sharedMatch[1]);
    } else {
      await refreshSpread('classic3');
      selectorCollapsed.value = false;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  }
});
</script>




