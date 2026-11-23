<script setup>
import { computed } from 'vue';

// Сцена 4 (ночь): цифры результата растут вместе с прокруткой.
const props = defineProps({ progress: { type: Number, default: 0 } });

const RESOLVED_FROM = 34;
const RESOLVED_TO = 87;
const WEEK = [0.35, 0.5, 0.45, 0.7, 0.62, 0.85, 1];
const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const eased = computed(() => 1 - Math.pow(1 - Math.min(1, props.progress * 1.4), 3));
const resolved = computed(() => Math.round(RESOLVED_FROM + (RESOLVED_TO - RESOLVED_FROM) * eased.value));
const hours = computed(() => (48 - 45.6 * eased.value).toFixed(1));
</script>

<template>
  <div class="scene scene-insights">
    <div class="insight-card">
      <div class="insight-row">
        <div>
          <div class="metric-label">Решено</div>
          <div class="metric-value metric-value-xl num">{{ resolved }}%</div>
        </div>
        <div class="text-right">
          <div class="metric-label">Среднее время</div>
          <div class="metric-value num">{{ hours }} ч</div>
        </div>
      </div>
      <div class="insight-bars">
        <div v-for="(h, i) in WEEK" :key="i" class="insight-bar">
          <span :style="{ height: `${h * eased * 100}%` }" />
          <small>{{ DAYS[i] }}</small>
        </div>
      </div>
      <div class="bar"><span :style="{ width: `${resolved}%` }" /></div>
    </div>
  </div>
</template>
