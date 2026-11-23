<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { baseOptions, themeColors } from './registerCharts';
import { useTheme } from '@/composables/useTheme';

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  height: { type: String, default: '220px' },
});

const { theme } = useTheme();

const chart = computed(() => {
  theme.value; // пересчитать при смене темы
  const c = themeColors();
  return {
    data: {
      labels: props.labels,
      datasets: [
        {
          data: props.values,
          borderColor: c.accent,
          backgroundColor: c.accentSoft,
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: c.accent,
          pointHoverBorderColor: c.surface,
          pointHoverBorderWidth: 2,
        },
      ],
    },
    options: baseOptions(c),
  };
});
</script>

<template>
  <div :style="{ height }"><Line :key="theme" :data="chart.data" :options="chart.options" /></div>
</template>
