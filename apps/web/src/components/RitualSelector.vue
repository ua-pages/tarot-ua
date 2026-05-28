<template>
  <section ref="sectionRef" class="panel controls-panel ritual-panel" :class="{ collapsed }">
    <div class="ritual-head practice-head">
      <div>
        <p class="eyebrow">Спосіб тихої сесії</p>
        <h2>Якою буде ваша практика?</h2>
        <p class="muted">Не шукайте “правильний” варіант. Оберіть той ритм, який сьогодні відчувається спокійніше.</p>
      </div>
      <button v-if="collapsed" class="btn btn-ghost" type="button" @click="$emit('expand')">Змінити практику</button>
    </div>

    <Transition name="ritual-collapse">
      <div v-if="!collapsed" class="spread-selector spread-selector-v2 practice-grid">
        <button
          v-for="definition in definitions"
          :key="definition.id"
          class="spread-button spread-choice practice-card"
          :class="{ active: activeType === definition.id }"
          :disabled="loading"
          @click="$emit('choose', definition.id)"
        >
          <span class="practice-mark" aria-hidden="true">
            <span class="practice-count">{{ definition.count }}</span>
            <span class="practice-count-label">карт{{ definition.count === 3 ? 'и' : '' }}</span>
          </span>

          <span class="choice-body practice-body">
            <span class="practice-kicker">{{ spreadMeta(definition.id).kicker }}</span>
            <strong>{{ spreadMeta(definition.id).title }}</strong>
            <small>{{ spreadMeta(definition.id).description }}</small>
            <em>{{ spreadMeta(definition.id).pace }}</em>
          </span>

          <span class="practice-symbol" aria-hidden="true">{{ spreadMeta(definition.id).icon }}</span>
        </button>
      </div>
    </Transition>

    <div v-if="collapsed && activeDefinition" class="active-ritual-summary active-practice-summary">
      <span>{{ spreadMeta(activeDefinition.id).icon }}</span>
      <div>
        <strong>{{ spreadMeta(activeDefinition.id).title }}</strong>
        <small>{{ spreadMeta(activeDefinition.id).description }}</small>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SpreadDefinition, SpreadType } from '../types';
import { spreadMeta } from '../constants/spreads';
import '../styles/ritual-selector.css';

const props = defineProps<{
  definitions: SpreadDefinition[];
  activeType: SpreadType;
  collapsed: boolean;
  loading: boolean;
}>();

defineEmits<{
  choose: [type: SpreadType];
  expand: [];
}>();

const sectionRef = ref<HTMLElement | null>(null);

defineExpose({
  scrollIntoView: () => sectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
});

const activeDefinition = computed(() => props.definitions.find((item) => item.id === props.activeType));
</script>


