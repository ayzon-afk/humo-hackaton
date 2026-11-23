<script setup>
import { computed, ref } from 'vue';
import { story } from '@/config/story';
import { useScrollProgress } from '@/composables/useScrollProgress';
import StoryCard from './StoryCard.vue';
import SceneProblem from './scenes/SceneProblem.vue';
import SceneCapture from './scenes/SceneCapture.vue';
import SceneMap from './scenes/SceneMap.vue';
import SceneInsights from './scenes/SceneInsights.vue';
import '@/styles/site-story.css';

// Scroll-история: секция высотой N экранов, внутри — «прилипшая» сцена.
// Прокрутка = перемотка истории (как ползунок времени в окне самолёта).
const SCENES = { problem: SceneProblem, capture: SceneCapture, map: SceneMap, insights: SceneInsights };

const section = ref(null);
const { progress, scrollToProgress } = useScrollProgress(section);

const index = computed(() => Math.min(story.length - 1, Math.floor(progress.value * story.length)));
const step = computed(() => story[index.value]);
/** Прогресс внутри текущего шага 0..1 — им управляются анимации сцен */
const local = (i) => Math.min(1, Math.max(0, progress.value * story.length - i));
</script>

<template>
  <section
    id="how"
    ref="section"
    class="story"
    :style="{ height: `${story.length * 100 + 40}vh` }"
    aria-label="Как это работает"
  >
    <div class="story-sticky">
      <div class="story-frame">
        <div class="story-stage" :style="{ background: step.stage }" :class="{ night: step.key === 'insights' }">
          <component
            :is="SCENES[s.key]"
            v-for="(s, i) in story"
            :key="s.key"
            class="scene-layer"
            :class="{ active: i === index, before: i < index }"
            :progress="local(i)"
            :aria-hidden="i !== index"
          />
        </div>
        <StoryCard :step="step" :steps="story" :progress="progress" @seek="scrollToProgress" />
      </div>
    </div>
  </section>
</template>
