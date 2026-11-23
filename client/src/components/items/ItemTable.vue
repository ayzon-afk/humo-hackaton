<script setup>
import { statusLabels, statusBadge, categoryLabels } from '@/config/labels';

defineProps({ items: { type: Array, default: () => [] } });
const emit = defineEmits(['status', 'remove']);

const nextStatus = { new: 'in_progress', in_progress: 'done', done: 'new' };
</script>

<template>
  <div class="overflow-x-auto card bg-base-200">
    <table class="table">
      <thead>
        <tr><th>Название</th><th>Категория</th><th>Приоритет</th><th>Статус</th><th /></tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>
            <div class="font-semibold">{{ item.title }}</div>
            <div class="text-xs opacity-60 line-clamp-1">{{ item.description }}</div>
          </td>
          <td>{{ categoryLabels[item.category] || item.category }}</td>
          <td>{{ '★'.repeat(item.priority || 0) }}</td>
          <td>
            <button class="badge cursor-pointer" :class="statusBadge[item.status]" @click="emit('status', item, nextStatus[item.status] || 'new')">
              {{ statusLabels[item.status] || item.status }}
            </button>
          </td>
          <td><button class="btn btn-ghost btn-xs" @click="emit('remove', item)">✕</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
