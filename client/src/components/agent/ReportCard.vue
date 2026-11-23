<script setup>
import { Sparkles } from 'lucide-vue-next';
import { formatDateTime } from '@/composables/useFormat';
import AlertList from './AlertList.vue';

defineProps({ report: { type: Object, required: true } });

const REASONS = { schedule: 'по расписанию', manual: 'вручную', startup: 'при запуске' };
</script>

<template>
  <article class="card">
    <div class="card-body flex flex-col gap-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <div class="report-eyebrow">
            <Sparkles aria-hidden="true" />Отчёт · {{ formatDateTime(report.createdAt) }} ·
            {{ REASONS[report.reason] || report.reason }}
          </div>
          <h2 class="mt-2">{{ report.ai.headline }}</h2>
        </div>
        <span class="text-xs text-tertiary whitespace-nowrap">{{
          report.source === 'ai' ? 'Написал AI' : 'По правилам'
        }}</span>
      </div>

      <p class="text-secondary">{{ report.ai.summary }}</p>

      <div class="report-metrics">
        <div>
          <span class="metric-label">Новых за сутки</span
          ><span class="metric-value num">{{ report.metrics.created24h }}</span>
        </div>
        <div>
          <span class="metric-label">Решено за сутки</span
          ><span class="metric-value num">{{ report.metrics.resolved24h }}</span>
        </div>
        <div>
          <span class="metric-label">Открыто</span><span class="metric-value num">{{ report.metrics.open }}</span>
        </div>
        <div>
          <span class="metric-label">Среднее время</span>
          <span class="metric-value num"
            >{{ report.metrics.avgResolveHours ?? '—' }}<small v-if="report.metrics.avgResolveHours"> ч</small></span
          >
        </div>
      </div>

      <div class="flex flex-col gap-3">
        <span class="card-title">Что сделать сегодня</span>
        <ol class="recommendations">
          <li v-for="(r, i) in report.ai.recommendations" :key="i">{{ r }}</li>
        </ol>
      </div>
    </div>
    <div class="divider" />
    <div class="card-header pb-2"><span class="card-title">Тревоги на момент отчёта</span></div>
    <AlertList :alerts="report.alerts" class="mb-2" />
  </article>
</template>
