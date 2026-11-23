<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import { statsApi } from '@/api/stats';
import { crudApi } from '@/api/crud';
import { project } from '@/config/project';
import { statusOrder, categoryLabels } from '@/config/labels';
import { getSocket } from '@/realtime/socket';
import { useAuthStore } from '@/stores/auth';
import { greeting, todayLabel } from '@/composables/useGreeting';
import PageHeader from '@/components/ui/PageHeader.vue';
import StatusLabel from '@/components/ui/StatusLabel.vue';
import LineChart from '@/components/charts/LineChart.vue';
import BreakdownList from '@/components/charts/BreakdownList.vue';

const auth = useAuthStore();
const stats = ref(null);
const recent = ref([]);
const api = crudApi(project.mainCollection);

async function load() {
  const [s, r] = await Promise.all([statsApi.get(project.mainCollection), api.list({ limit: 5 })]);
  stats.value = s;
  recent.value = r;
}

const week = computed(() => {
  const t = stats.value?.timeline || [];
  const sum = (arr) => arr.reduce((a, d) => a + d.count, 0);
  const now = sum(t.slice(-7));
  const prev = sum(t.slice(-14, -7));
  const delta = prev ? Math.round(((now - prev) / prev) * 100) : 0;
  return { now, delta };
});

const doneRate = computed(() => {
  const s = stats.value;
  return s?.total ? Math.round(((s.byStatus.done || 0) / s.total) * 100) : 0;
});

const categories = computed(() =>
  Object.entries(stats.value?.byCategory || {})
    .map(([k, v]) => ({ label: categoryLabels[k] || k, value: v }))
    .sort((a, b) => b.value - a.value),
);

const events = ['created', 'updated', 'deleted'].map((e) => `${project.mainCollection}:${e}`);
onMounted(() => {
  load();
  events.forEach((e) => getSocket().on(e, load));
});
onBeforeUnmount(() => events.forEach((e) => getSocket().off(e, load)));
</script>

<template>
  <div>
    <PageHeader :title="`${greeting()}, ${auth.user?.name || ''}`" :subtitle="todayLabel()" />

    <div v-if="!stats" class="grid gap-4 lg:grid-cols-3">
      <div class="card skeleton h-72 lg:col-span-2" />
      <div class="card skeleton h-72" />
    </div>

    <div v-else class="grid gap-4 lg:grid-cols-3">
      <!-- Главная карточка: одна большая цифра + тренд -->
      <section class="card lg:col-span-2">
        <div class="card-body flex flex-col gap-6">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div class="metric-label">Всего записей</div>
              <div class="metric-value metric-value-xl">{{ stats.total.toLocaleString('ru-RU') }}</div>
              <div class="metric-delta mt-1" :class="week.delta >= 0 ? 'up' : 'down'">
                {{ week.delta >= 0 ? '+' : '' }}{{ week.delta }}% за неделю
              </div>
            </div>
            <div class="flex gap-8">
              <div>
                <div class="metric-label">За 7 дней</div>
                <div class="metric-value num">{{ week.now }}</div>
              </div>
              <div>
                <div class="metric-label">Решено</div>
                <div class="metric-value num">{{ doneRate }}%</div>
              </div>
            </div>
          </div>
          <LineChart
            :labels="stats.timeline.map((d) => d.day.slice(8) + '.' + d.day.slice(5, 7))"
            :values="stats.timeline.map((d) => d.count)"
          />
        </div>
      </section>

      <!-- Статусы -->
      <section class="card flex flex-col">
        <div class="card-header"><span class="card-title">По статусам</span></div>
        <ul class="list mt-3">
          <li v-for="s in statusOrder" :key="s" class="list-row">
            <StatusLabel :status="s" class="flex-1" />
            <span class="num font-medium">{{ stats.byStatus[s] || 0 }}</span>
          </li>
        </ul>
        <div class="card-body mt-auto">
          <div class="flex justify-between text-xs text-tertiary mb-2">
            <span>Прогресс решения</span><span class="num">{{ doneRate }}%</span>
          </div>
          <div class="bar accent"><span :style="{ width: doneRate + '%' }" /></div>
        </div>
      </section>

      <!-- Последние записи -->
      <section class="card lg:col-span-2">
        <div class="card-header">
          <span class="card-title">Последние записи</span>
          <RouterLink to="/app/items" class="btn btn-ghost btn-sm">Все записи <ArrowRight /></RouterLink>
        </div>
        <ul class="list mt-2 mb-2">
          <li v-for="item in recent" :key="item.id" class="list-row">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ item.title }}</div>
              <div class="text-xs text-tertiary">{{ categoryLabels[item.category] || item.category }}</div>
            </div>
            <StatusLabel :status="item.status" />
          </li>
        </ul>
      </section>

      <!-- Категории -->
      <section class="card">
        <div class="card-header"><span class="card-title">По категориям</span></div>
        <div class="px-6 pb-4 pt-1"><BreakdownList :items="categories" /></div>
      </section>
    </div>
  </div>
</template>
