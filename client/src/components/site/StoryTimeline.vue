<script setup>
import { ref } from 'vue';

// Полоса как в видео: сегменты шагов + бегунок. Бегунок можно тянуть — страница прокрутится.
const props = defineProps({
  steps: { type: Array, required: true },
  progress: { type: Number, default: 0 },
});
const emit = defineEmits(['seek']);

const track = ref(null);
const dragging = ref(false);

function seekFromPointer(event) {
  const rect = track.value.getBoundingClientRect();
  emit('seek', Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)), false);
}

function onDown(event) {
  dragging.value = true;
  track.value.setPointerCapture(event.pointerId);
  seekFromPointer(event);
}

const onMove = (event) => dragging.value && seekFromPointer(event);
const onUp = () => (dragging.value = false);

/** Клавиатура: стрелки двигают по шагам */
function onKey(event) {
  const step = 1 / props.steps.length;
  if (event.key === 'ArrowRight') emit('seek', Math.min(1, props.progress + step), true);
  if (event.key === 'ArrowLeft') emit('seek', Math.max(0, props.progress - step), true);
}
</script>

<template>
  <div class="timeline-wrap">
    <div
      ref="track"
      class="timeline-track"
      :class="{ dragging }"
      role="slider"
      tabindex="0"
      aria-label="Шаг истории"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(progress * 100)"
      @pointerdown="onDown"
      @pointermove="onMove"
      @pointerup="onUp"
      @pointercancel="onUp"
      @keydown="onKey"
    >
      <span v-for="(s, i) in steps" :key="s.key" class="timeline-seg" :style="{ '--seg': i / (steps.length - 1) }" />
      <span class="timeline-thumb" :style="{ left: `${progress * 100}%` }" />
    </div>
    <div class="timeline-labels">
      <button v-for="(s, i) in steps" :key="s.key" type="button" @click="emit('seek', (i + 0.5) / steps.length, true)">
        {{ s.label }}
      </button>
    </div>
  </div>
</template>
