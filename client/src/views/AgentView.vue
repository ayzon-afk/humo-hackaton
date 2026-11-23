<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Play } from 'lucide-vue-next';
import { agentApi } from '@/api/agent';
import { getSocket } from '@/realtime/socket';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { formatDateTime, timeAgo } from '@/composables/useFormat';
import PageHeader from '@/components/ui/PageHeader.vue';
import EmptyState from '@/components/ui/EmptyState.vue';
import ReportCard from '@/components/agent/ReportCard.vue';
import AlertList from '@/components/agent/AlertList.vue';

const auth = useAuthStore();
const { push } = useToast();
const status = ref(null);
const reports = ref([]);
const running = ref(false);

const canRun = computed(() => ['admin', 'manager'].includes(auth.user?.role));
const latest = computed(() => reports.value[0]);
const history = computed(() => reports.value.slice(1, 8));

async function load() {
  [status.value, reports.value] = await Promise.all([agentApi.status(), agentApi.reports()]);
}

async function run() {
  running.value = true;
  try {
    await agentApi.run(); // сам отчёт придёт через WebSocket
  } catch (e) {
    push(e.message, 'error');
  } finally {
    running.value = false;
  }
}

const onReport = (report) => {
  reports.value = [report, ...reports.value.filter((r) => r.id !== report.id)];
  push('Агент подготовил новый отчёт', 'success');
};
const onAlert = (alert) => {
  push(`Агент: ${alert.title}`, 'error', 5000);
  agentApi.status().then((s) => (status.value = s));
};

onMounted(() => {
  load();
  getSocket().on('agent:report', onReport);
  getSocket().on('agent:alert', onAlert);
});
onBeforeUnmount(() => {
  getSocket().off('agent:report', onReport);
  getSocket().off('agent:alert', onAlert);
});
</script>

<template>
  <div>
    <PageHeader title="AI-агент" subtitle="Следит за данными круглосуточно и каждый день присылает отчёт">
      <button v-if="canRun" class="btn btn-primary" :aria-busy="running" @click="run">
        <span v-if="running" class="spinner" /><Play v-else aria-hidden="true" />Сформировать отчёт
      </button>
    </PageHeader>

    <div class="grid gap-4 lg:grid-cols-[1fr_320px]">
      <div class="flex flex-col gap-4">
        <div v-if="!status" class="card skeleton h-96" />
        <ReportCard v-else-if="latest" :report="latest" />
        <section v-else class="card">
          <EmptyState title="Отчётов пока нет" text="Первый отчёт появится по расписанию или по кнопке." />
        </section>

        <section v-if="history.length" class="card">
          <div class="card-header"><span class="card-title">Прошлые отчёты</span></div>
          <ul class="list mt-2 mb-2">
            <li v-for="r in history" :key="r.id" class="list-row">
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium truncate">{{ r.ai.headline }}</div>
                <div class="text-xs text-tertiary">{{ formatDateTime(r.createdAt) }}</div>
              </div>
              <span class="text-xs text-secondary">{{ r.alerts.length }} тревог</span>
            </li>
          </ul>
        </section>
      </div>

      <aside class="flex flex-col gap-4">
        <section class="card card-body flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <span class="agent-pulse" aria-hidden="true" />
            <span class="card-title">{{ status?.enabled === false ? 'Агент выключен' : 'Агент работает' }}</span>
          </div>
          <dl v-if="status" class="props">
            <dt>Отчёт каждый день</dt>
            <dd>{{ status.reportTime }}</dd>
            <dt>Следующий</dt>
            <dd>{{ status.nextReportAt ? formatDateTime(status.nextReportAt) : '—' }}</dd>
            <dt>Проверка тревог</dt>
            <dd>каждые {{ status.checkMinutes }} мин</dd>
            <dt>Последняя</dt>
            <dd>{{ status.lastCheckAt ? timeAgo(status.lastCheckAt) : '—' }}</dd>
            <dt>Telegram</dt>
            <dd>{{ status.telegram ? 'Подключён' : 'Не подключён' }}</dd>
          </dl>
        </section>

        <section class="card">
          <div class="card-header">
            <span class="card-title">Сейчас</span><span class="text-xs text-tertiary">живые данные</span>
          </div>
          <AlertList :alerts="status?.alerts || []" class="mt-2 mb-2" />
        </section>
      </aside>
    </div>
  </div>
</template>
