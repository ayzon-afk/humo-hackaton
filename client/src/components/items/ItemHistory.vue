<script setup>
import { statusLabels, categoryLabels } from '@/config/labels';
import { formatDateTime } from '@/composables/useFormat';

defineProps({ history: { type: Array, default: () => [] } });

const FIELD_LABELS = {
  status: 'статус',
  category: 'категорию',
  priority: 'приоритет',
  title: 'название',
  description: 'описание',
};

/** Человеческое описание события из журнала */
function describe(entry) {
  if (entry.type === 'created') return 'создал(а) запись';
  const label = FIELD_LABELS[entry.field] || entry.field;
  const pretty = (v) => statusLabels[v] || categoryLabels[v] || v;
  if (entry.field === 'description') return 'обновил(а) описание';
  return `изменил(а) ${label}: ${pretty(entry.from) ?? '—'} → ${pretty(entry.to)}`;
}
</script>

<template>
  <ol class="timeline">
    <li v-for="(entry, i) in [...history].reverse()" :key="i">
      <div class="text-sm">
        <span class="font-medium">{{ entry.by }}</span> {{ describe(entry) }}
      </div>
      <div class="when">{{ formatDateTime(entry.at) }}</div>
    </li>
  </ol>
</template>
