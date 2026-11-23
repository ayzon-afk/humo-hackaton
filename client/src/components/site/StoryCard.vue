<script setup>
import StoryTimeline from './StoryTimeline.vue';

// Белая карточка снизу сцены: номер шага, заголовок, подпись, таймлайн, кнопка
defineProps({
  step: { type: Object, required: true },
  steps: { type: Array, required: true },
  progress: { type: Number, default: 0 },
});
defineEmits(['seek']);
</script>

<template>
  <div class="story-card">
    <div class="story-card-head">
      <Transition name="swap" mode="out-in">
        <span :key="step.number" class="story-number">{{ step.number }}</span>
      </Transition>
      <span class="story-label">{{ step.label }}</span>
    </div>
    <Transition name="swap" mode="out-in">
      <div :key="step.key">
        <h3 class="story-title">{{ step.title }}</h3>
        <p class="status story-caption" :data-tone="step.tone">{{ step.caption }}</p>
      </div>
    </Transition>
    <StoryTimeline :steps="steps" :progress="progress" @seek="(v, smooth) => $emit('seek', v, smooth)" />
    <RouterLink to="/login" class="btn btn-primary btn-lg btn-pill btn-block">Попробовать демо</RouterLink>
  </div>
</template>
