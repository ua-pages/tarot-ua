<template>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">Пет-проєкт для портфоліо</p>
      <h1>Таро Черіот</h1>
      <p class="subtitle">Vue + NestJS + JanusGraph. Онлайн-розклад і щоденна карта.</p>
      <div class="hero-actions">
        <button class="btn" :disabled="loading" @click="refreshSpread(3)">
          {{ loading ? 'Оновлюю розклад...' : 'Зробити розклад на 3 карти' }} 
        </button>
          <button class="btn btn-secondary" :disabled="loading" @click="refreshSpread(5)">
          {{ loading ? 'Оновлюю розклад...' : 'Розклад на 5 карт (Пентаграма)' }}
        </button>
      </div>
    </header>

    <section class="panel">
      <h2>Карта дня</h2>
      <p class="muted">{{ todayLabel }}</p>
      <p v-if="error" class="error">{{ error }}</p>

      <article v-if="cardOfDay" class="card-day">
        <img class="card-image" :src="cardOfDay.card.image" :alt="cardOfDay.card.name" loading="lazy" />
        <div>
          <p class="position">{{ cardOfDay.position }}</p>
          <h3>
            {{ cardOfDay.card.name }}
            <span v-if="cardOfDay.reversed">(перевернута)</span>
          </h3>
          <p class="keywords">{{ cardOfDay.card.keywords.join(' · ') }}</p>
          <p>{{ cardMeaning(cardOfDay) }}</p>
        </div>
      </article>
    </section>

    <section class="panel">
      <h2>Поточний розклад</h2>
      
      <!-- Розклад на 3 карти -->
      <div v-if="spread.length === 3" class="spread-grid-3">
        <article v-for="item in spread" :key="`${item.position}-${item.card.id}`" class="card-item">
          <img class="card-image" :src="item.card.image" :alt="item.card.name" loading="lazy" />
          <p class="position">{{ item.position }}</p>
          <h3>
            {{ item.card.name }}
            <span v-if="item.reversed">(перевернута)</span>
          </h3>
          <p class="keywords">{{ item.card.keywords.join(' · ') }}</p>
          <p>{{ cardMeaning(item) }}</p>
        </article>
      </div>

      <!-- Розклад на 5 карт пентограмою -->
      <div v-else-if="spread.length === 5" class="spread-pentagram">
        <article 
          v-for="(item, index) in spread" 
          :key="`${item.position}-${item.card.id}`" 
          class="card-item pentagram-card"
          :class="`position-${index}`"
        >
          <img class="card-image" :src="item.card.image" :alt="item.card.name" loading="lazy" />
          <p class="position">{{ item.position }}</p>
          <h3>
            {{ item.card.name }}
            <span v-if="item.reversed">(перевернута)</span>
          </h3>
          <p class="keywords">{{ item.card.keywords.join(' · ') }}</p>
          <p>{{ cardMeaning(item) }}</p>
        </article>
      </div>

      <p v-else class="muted">Натисни кнопку і отримай свій розклад.</p>
    </section>

    <section class="panel">
      <h2>Колода ({{ cards.length }} карт)</h2>
      <ul class="deck-list">
        <li v-for="card in cards" :key="card.id">
          <img class="deck-thumb" :src="card.image" :alt="card.name" loading="lazy" />
          <div>
            <strong>{{ card.name }}</strong>
            <span>{{ card.keywords.join(', ') }}</span>
          </div>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { drawSpread, fetchCardOfDay, fetchCards } from '../services/api';
import { cardMeaning } from '../utils';
import type { DrawnCard, TarotCard } from '../types';

const cards = ref<TarotCard[]>([]);
const spread = ref<DrawnCard[]>([]);
const cardOfDay = ref<DrawnCard | null>(null);
const loading = ref(false);
const error = ref('');

const todayLabel = new Intl.DateTimeFormat('uk-UA', {
  dateStyle: 'full'
}).format(new Date());

async function loadCards() {
  cards.value = await fetchCards(10);
}

async function loadCardOfDay() {
  cardOfDay.value = await fetchCardOfDay();
}

async function refreshSpread(count: number) {
  loading.value = true;
  error.value = '';

  try {
    spread.value = await drawSpread(count);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  try {
    await Promise.all([loadCards(), loadCardOfDay(), refreshSpread(3)]);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Сталася помилка';
  }
});
</script>

<style scoped>
.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 12px 24px;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn:hover:not(:disabled) {
  background: #6b3410;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #d4a574;
}

.btn-secondary:hover:not(:disabled) {
  background: #c9935f;
}

/* Розклад на 3 карти */
.spread-grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 20px 0;
}


/* Розклад на 5 карт пентограмою */
.spread-pentagram {
  position: relative;
  width: 100%;
  height: 600px;
  margin: 40px 0;
}

.pentagram-card {
  position: absolute;
  width: 180px;
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 15px;
  background: #f5e6d3;
  text-align: center;
}

/* Позиції пентаграми */
.pentagram-card.position-0 {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.pentagram-card.position-1 {
  top: 150px;
  left: 10%;
}


.pentagram-card.position-2 {
  top: 380px;
  right: 10%;
}

.pentagram-card.position-3 {
  top: 380px;
  left: 10%;
}

.pentagram-card.position-4 {
  top: 150px;
  right: 10%;
}

.card-item {
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 15px;
  background: #f5e6d3;
}


.card-image {
  width: 100%;
  height: auto;
  margin-bottom: 10px;
  border-radius: 4px;
}

.position {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.card-item h3 {
  margin: 10px 0;
  color: #333;
  font-size: 16px;
}


.keywords {
  font-size: 12px;
  color: #8b4513;
  margin: 5px 0;
}

.card-day {
  display: flex;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: #f5e6d3;
  border-radius: 8px;
  border: 2px solid #8b4513;
}

.card-day .card-image {
  width: 150px;
  height: auto;
  flex-shrink: 0;
}

.deck-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}


.deck-list li {
  display: flex;
  gap: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.deck-thumb {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: 4px;
}

.error {
  color: #d32f2f;
  font-weight: 600;
}

.muted {
  color: #666;
  font-size: 14px;
}

</style>
