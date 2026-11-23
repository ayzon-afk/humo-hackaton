<script setup>
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/composables/useTheme';
import { healthApi } from '@/api/health';
import { roleLabels } from '@/config/roles';
import { project } from '@/config/project';
import { initials } from '@/composables/useFormat';
import PageHeader from '@/components/ui/PageHeader.vue';
import SegmentedControl from '@/components/ui/SegmentedControl.vue';

const auth = useAuthStore();
const { theme, setTheme } = useTheme();
const health = ref(null);

const DB_LABELS = { postgres: 'PostgreSQL', file: 'JSON-файл (демо)' };

const themeOptions = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
];

const themeModel = computed({ get: () => theme.value, set: setTheme });

onMounted(async () => {
  try {
    health.value = await healthApi.get();
  } catch {
    health.value = { ok: false };
  }
});
</script>

<template>
  <div class="max-w-3xl">
    <PageHeader title="Настройки" />

    <div class="flex flex-col gap-4">
      <section class="card card-body flex items-center gap-4">
        <span class="avatar" style="width: 56px; height: 56px; font-size: 18px">{{ initials(auth.user?.name) }}</span>
        <div class="flex-1 min-w-0">
          <h3>{{ auth.user?.name }}</h3>
          <p class="text-sm text-secondary">{{ auth.user?.email }} · {{ roleLabels[auth.user?.role] }}</p>
        </div>
      </section>

      <section class="card">
        <div class="card-header"><span class="card-title">Оформление</span></div>
        <div class="card-body flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div class="text-sm font-medium">Тема</div>
            <div class="text-xs text-tertiary">Светлая лучше читается на проекторе</div>
          </div>
          <SegmentedControl v-model="themeModel" :options="themeOptions" label="Тема" />
        </div>
      </section>

      <section class="card">
        <div class="card-header"><span class="card-title">Система</span></div>
        <div class="card-body">
          <dl class="props">
            <dt>Сервер</dt>
            <dd>
              <span class="status" :data-tone="health?.ok ? 'success' : 'danger'">{{
                health ? (health.ok ? 'Работает' : 'Недоступен') : '…'
              }}</span>
            </dd>
            <dt>AI</dt>
            <dd>
              <span class="status" :data-tone="health?.ai ? 'success' : 'warning'">{{
                health?.ai ? 'Подключён' : 'Демо-режим'
              }}</span>
            </dd>
            <dt>База данных</dt>
            <dd>{{ DB_LABELS[health?.db] || '—' }}</dd>
            <dt>Данные</dt>
            <dd>{{ health?.collections?.join(', ') || '—' }}</dd>
            <dt>Версия</dt>
            <dd>{{ project.name }} 1.0</dd>
          </dl>
        </div>
      </section>
    </div>
  </div>
</template>
