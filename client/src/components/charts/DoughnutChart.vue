<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import './registerCharts';

const props = defineProps({
  labels: { type: Array, default: () => [] },
  values: { type: Array, default: () => [] },
});

const COLORS = ['#38bdf8', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#f472b6'];

const data = computed(() => ({
  labels: props.labels,
  datasets: [{ data: props.values, backgroundColor: COLORS, borderWidth: 0 }],
}));

const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
</script>

<template>
  <div class="h-64"><Doughnut :data="data" :options="options" /></div>
</template>
