<script setup>
import { computed, onMounted, ref } from 'vue';
import { statsApi } from '@/api/stats';
import { project } from '@/config/project';
import { statusLabels, statusIcons, categoryLabels } from '@/config/labels';
import { getSocket } from '@/realtime/socket';
import StatCard from '@/components/ui/StatCard.vue';
import LoadingBlock from '@/components/ui/LoadingBlock.vue';
import LineChart from '@/components/charts/LineChart.vue';
import DoughnutChart from '@/components/charts/DoughnutChart.vue';

const stats = ref(null);

async function load() {
  stats.value = await statsApi.get(project.mainCollection);
}

const categories = computed(() => Object.entries(stats.value?.byCategory || {}));

onMounted(() => {
  load();
  // Дашборд пересчитывается вживую при любом изменении
  const socket = getSocket();
  ['created', 'updated', 'deleted'].forEach((e) => socket.on(`${project.mainCollection}:${e}`, load));
});
</script>

<template>
  <LoadingBlock v-if="!stats" />
  <div v-else class="flex flex-col gap-6">
    <h1 class="text-2xl font-black">Дашборд</h1>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Всего" :value="stats.total" icon="📦" />
      <StatCard v-for="(count, key) in stats.byStatus" :key="key" :title="statusLabels[key] || key" :value="count" :icon="statusIcons[key] || '•'" />
    </div>

    <div class="grid lg:grid-cols-3 gap-4">
      <div class="card bg-base-200 lg:col-span-2">
        <div class="card-body">
          <h3 class="card-title text-base">Динамика за 14 дней</h3>
          <LineChart :labels="stats.timeline.map((d) => d.day.slice(5))" :values="stats.timeline.map((d) => d.count)" />
        </div>
      </div>
      <div class="card bg-base-200">
        <div class="card-body">
          <h3 class="card-title text-base">По категориям</h3>
          <DoughnutChart :labels="categories.map(([k]) => categoryLabels[k] || k)" :values="categories.map(([, v]) => v)" />
        </div>
      </div>
    </div>
  </div>
</template>
