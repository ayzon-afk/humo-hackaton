<script setup>
import { computed } from 'vue';

// Сцена 3: точки появляются на карте по мере прокрутки. Последняя — пульсирует.
const props = defineProps({ progress: { type: Number, default: 0 } });

const TONES = { new: 'var(--accent)', work: 'var(--warning)', done: 'var(--success)' };
const POINTS = [
  [120, 90, 'done'],
  [210, 150, 'work'],
  [330, 80, 'new'],
  [420, 190, 'done'],
  [160, 250, 'new'],
  [290, 230, 'work'],
  [470, 110, 'new'],
  [380, 300, 'done'],
  [90, 320, 'work'],
  [520, 260, 'new'],
  [250, 330, 'new'],
  [450, 340, 'work'],
  [200, 60, 'done'],
  [540, 70, 'new'],
];

const visible = computed(() => Math.max(1, Math.ceil(props.progress * POINTS.length)));
const counts = computed(() => {
  const shown = POINTS.slice(0, visible.value);
  return { total: shown.length, urgent: shown.filter((p) => p[2] === 'new').length };
});
</script>

<template>
  <div class="scene scene-map">
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      class="map-svg"
      role="img"
      aria-label="Карта обращений"
    >
      <path class="river" d="M-10 300 C 120 250, 200 360, 320 300 S 520 220, 620 260" />
      <g class="roads">
        <path d="M0 120 H600" />
        <path d="M0 220 H600" />
        <path d="M0 330 H600" />
        <path d="M150 0 V400" />
        <path d="M300 0 V400" />
        <path d="M450 0 V400" />
        <path d="M0 40 L600 380" class="avenue" />
      </g>
      <g
        v-for="([x, y, s], i) in POINTS"
        :key="i"
        class="pin"
        :class="{ show: i < visible, latest: i === visible - 1 }"
      >
        <circle :cx="x" :cy="y" r="16" class="pin-pulse" :style="{ fill: TONES[s] }" />
        <circle :cx="x" :cy="y" r="7" :style="{ fill: TONES[s] }" class="pin-dot" />
      </g>
    </svg>
    <div class="map-badge">
      <span class="num">{{ counts.total }}</span> обращений ·
      <span class="status" data-tone="info">{{ counts.urgent }} новых</span>
    </div>
  </div>
</template>
