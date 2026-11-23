<script setup>
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import './registerCharts';

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
  label: { type: String, default: 'Количество' },
});

const data = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: props.label,
      data: props.values,
      borderColor: '#38bdf8',
      backgroundColor: 'rgba(56,189,248,0.15)',
      fill: true,
      tension: 0.35,
    },
  ],
}));

const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
</script>

<template>
  <div class="h-64"><Line :data="data" :options="options" /></div>
</template>
