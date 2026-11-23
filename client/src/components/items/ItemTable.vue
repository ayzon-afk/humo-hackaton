<script setup>
import { Trash2 } from 'lucide-vue-next';
import { categoryLabels, statusOrder } from '@/config/labels';
import StatusLabel from '@/components/ui/StatusLabel.vue';
import PriorityMeter from '@/components/ui/PriorityMeter.vue';
import { formatDate as date } from '@/composables/useFormat';

defineProps({
  items: { type: Array, default: () => [] },
  freshIds: { type: Set, default: () => new Set() },
});
const emit = defineEmits(['status', 'remove']);

const next = (s) => statusOrder[(statusOrder.indexOf(s) + 1) % statusOrder.length];
</script>

<template>
  <div class="table-wrap">
    <table class="table">
      <thead>
        <tr>
          <th>Запись</th>
          <th>Категория</th>
          <th>Приоритет</th>
          <th>Статус</th>
          <th>Дата</th>
          <th><span class="sr-only">Действия</span></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id" :class="{ 'row-new': freshIds.has(item.id) }">
          <td>
            <RouterLink :to="`/app/items/${item.id}`" class="cell-title cell-link">{{ item.title }}</RouterLink>
            <div v-if="item.description" class="cell-sub">{{ item.description }}</div>
          </td>
          <td class="text-secondary">{{ categoryLabels[item.category] || item.category }}</td>
          <td><PriorityMeter :value="item.priority || 0" /></td>
          <td><StatusLabel :status="item.status" interactive @click="emit('status', item, next(item.status))" /></td>
          <td class="text-tertiary num">{{ date(item.createdAt) }}</td>
          <td class="text-right">
            <span class="row-actions">
              <button
                class="btn btn-danger btn-icon btn-sm"
                aria-label="Удалить"
                title="Удалить"
                @click="emit('remove', item)"
              >
                <Trash2 />
              </button>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
