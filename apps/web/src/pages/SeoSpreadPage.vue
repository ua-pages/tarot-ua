<template>
  <main class="seo-page">
    <a class="seo-back" href="/">← До головної</a>

    <section v-if="loading" class="seo-panel">Завантажую розклад...</section>
    <section v-else-if="!spreadDefinition" class="seo-panel">
      <p class="eyebrow">404</p>
      <h1>Розклад не знайдено</h1>
      <p class="muted">Можливо, цей тип розкладу ще не додано.</p>
      <a class="seo-btn" href="/">Обрати інший розклад</a>
    </section>

    <template v-else>
      <section class="seo-hero">
        <div class="seo-copy">
          <p class="eyebrow">Розклад Таро</p>
          <h1>{{ spreadDefinition.title }}</h1>
          <p class="seo-lead">{{ seoDescription }}</p>
          <a class="seo-btn" :href="`/?spread=${spreadDefinition.id}`">Спробувати цей розклад</a>
        </div>
        <div class="seo-spread-preview" :class="`cards-${spreadDefinition.count}`">
          <span v-for="(_, index) in spreadDefinition.positions" :key="index">{{ index + 1 }}</span>
        </div>
      </section>

      <section class="seo-panel seo-wide">
        <h2>Коли обирати цей розклад</h2>
        <p>{{ useCase }}</p>
      </section>

      <section class="seo-grid positions-grid" aria-label="Позиції розкладу">
        <article v-for="(position, index) in spreadDefinition.positions" :key="position.name" class="seo-panel">
          <p class="eyebrow">Позиція {{ index + 1 }}</p>
          <h2>{{ position.name }}</h2>
          <p>{{ position.description }}</p>
        </article>
      </section>

      <section class="seo-panel seo-wide seo-faq" aria-labelledby="spread-faq-title">
        <h2 id="spread-faq-title">Поширені питання</h2>
        <details v-for="item in faqItems" :key="item.question">
          <summary>{{ item.question }}</summary>
          <p>{{ item.answer }}</p>
        </details>
      </section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { fetchSpreadDefinitions } from '../services/api';
import { buildFaqJsonLd, setJsonLd, setSeoMeta } from '../seo/meta';
import { ORG_NAME, SPREAD_DEFAULT_DESCRIPTION } from '../constants/seo';
import { SPREAD_SLUG_TO_TYPE, SPREAD_USE_CASE } from '../constants/spreads';
import type { SpreadDefinition, SpreadType } from '../types';

const props = defineProps<{ slug: string }>();
const loading = ref(true);
const spreadDefinition = ref<SpreadDefinition | null>(null);

const seoDescription = computed(() => {
  if (!spreadDefinition.value) return SPREAD_DEFAULT_DESCRIPTION;
  return `${spreadDefinition.value.title} — онлайн-розклад на ${spreadDefinition.value.count} карт із поясненням кожної позиції та цілісним тлумаченням.`;
});

const useCase = computed(() => {
  if (!spreadDefinition.value) return '';
  return SPREAD_USE_CASE[spreadDefinition.value.id];
});

const faqItems = computed(() => {
  if (!spreadDefinition.value) return [];
  return [
    {
      question: `Для чого підходить розклад «${spreadDefinition.value.title}»?`,
      answer: useCase.value
    },
    {
      question: `Скільки карт у цьому розкладі?`,
      answer: `У цьому розкладі ${spreadDefinition.value.count} карт із поясненням кожної позиції.`
    },
    {
      question: 'Чи можна зробити цей розклад онлайн?',
      answer: 'Так, можна перейти до інтерактивного розкладу, отримати карти та зберегти або поділитися результатом.'
    }
  ];
});

onMounted(async () => {
  const definitions = await fetchSpreadDefinitions();
  const type = SPREAD_SLUG_TO_TYPE[props.slug] || props.slug as SpreadType;
  spreadDefinition.value = definitions.find((item) => item.id === type) || null;
  loading.value = false;

  if (spreadDefinition.value) {
    const title = `${spreadDefinition.value.title} — онлайн-розклад Таро`;
    setSeoMeta({
      title,
      description: seoDescription.value,
      canonicalPath: `/spreads/${props.slug}`,
      type: 'article'
    });

    setJsonLd('spread-page', {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: title,
      description: seoDescription.value,
      author: { '@type': 'Organization', name: ORG_NAME },
      mainEntityOfPage: `${window.location.origin}/spreads/${props.slug}`
    });
    setJsonLd('spread-faq', buildFaqJsonLd(faqItems.value));
  } else {
    setSeoMeta({
      title: `Розклад не знайдено — ${ORG_NAME}`,
      description: 'Сторінку розкладу Таро не знайдено.',
      canonicalPath: `/spreads/${props.slug}`
    });
  }
});
</script>
