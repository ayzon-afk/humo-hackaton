<script setup>
import { formatDateTime, humanizeKeys } from '@/composables/useFormat';

// Журнал: что AI предложил, кто решил и чем закончилось — прозрачность для владельца
defineProps({ history: { type: Array, default: () => [] } });

const TONES = { done: 'success', failed: 'danger', rejected: 'info' };
const LABELS = { done: 'Выполнено', failed: 'Не удалось', rejected: 'Отклонено' };
</script>

<template>
  <ol v-if="history.length" class="timeline px-6 pb-5">
    <li v-for="h in history" :key="h.id">
      <div class="text-sm font-medium">{{ humanizeKeys(h.summary) }}</div>
      <div class="text-xs text-secondary">{{ h.result }}</div>
      <div class="when">
        <span class="status" :data-tone="TONES[h.status]">{{ LABELS[h.status] }}</span>
        · {{ h.resolvedBy }} · {{ formatDateTime(h.resolvedAt) }}
      </div>
    </li>
  </ol>
  <p v-else class="text-sm text-secondary px-6 pb-5">Здесь появятся действия AI после вашего подтверждения.</p>
</template>
