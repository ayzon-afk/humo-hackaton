<script setup>
// Склад: остаток относительно нормы (три минимума = полная полоска). Ниже минимума — красная точка.
defineProps({ items: { type: Array, default: () => [] } });

const fill = (i) => `${Math.min(100, (i.quantity / (i.minQuantity * 3)) * 100)}%`;
const isLow = (i) => i.quantity <= i.minQuantity;
</script>

<template>
  <ul class="list">
    <li v-for="i in items" :key="i.id" class="list-row flex-col items-stretch gap-2">
      <div class="flex justify-between gap-3 text-sm">
        <span class="truncate">{{ i.name }}</span>
        <span v-if="isLow(i)" class="status num" data-tone="danger">{{ i.quantity }} {{ i.unit }}</span>
        <span v-else class="num text-secondary">{{ i.quantity }} {{ i.unit }}</span>
      </div>
      <div class="bar" :class="{ low: isLow(i) }"><span :style="{ width: fill(i) }" /></div>
    </li>
  </ul>
</template>
