<script setup>
import { humanizeKeys, timeAgo } from '@/composables/useFormat';

// Решения, которые AI подготовил и ждёт от человека «да» или «нет»
defineProps({
  proposals: { type: Array, default: () => [] },
  canDecide: Boolean,
});
const emit = defineEmits(['decide']);
</script>

<template>
  <ul v-if="proposals.length" class="list">
    <li v-for="p in proposals" :key="p.id" class="list-row proposal-row">
      <div class="flex-1 min-w-0">
        <div class="text-xs text-tertiary">{{ p.title }} · {{ timeAgo(p.createdAt) }}</div>
        <div class="text-sm font-medium">{{ humanizeKeys(p.summary) }}</div>
        <div v-if="p.reason" class="text-xs text-secondary">{{ humanizeKeys(p.reason) }}</div>
      </div>
      <div v-if="canDecide" class="flex gap-2">
        <button class="btn btn-ghost btn-sm" @click="emit('decide', p, false)">Отклонить</button>
        <button class="btn btn-secondary btn-sm" @click="emit('decide', p, true)">Подтвердить</button>
      </div>
    </li>
  </ul>
  <p v-else class="text-sm text-secondary px-6 pb-5">
    Все решения приняты — AI позвонит, когда понадобится ваше решение.
  </p>
</template>
