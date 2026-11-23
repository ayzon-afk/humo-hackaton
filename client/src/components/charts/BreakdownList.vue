<script setup>
import { computed } from 'vue';

// items: [{ label, value }] — синие полоски, лидер ярче остальных
const props = defineProps({ items: { type: Array, default: () => [] } });
const max = computed(() => Math.max(1, ...props.items.map((i) => i.value)));
const opacity = (index) => Math.max(0.35, 1 - index * 0.16);
</script>

<template>
  <ul class="list">
    <li v-for="(i, index) in items" :key="i.label" class="flex flex-col gap-2 py-3">
      <div class="flex justify-between text-sm">
        <span>{{ i.label }}</span>
        <span class="num font-medium">{{ i.value }}</span>
      </div>
      <div class="bar"><span :style="{ width: `${(i.value / max) * 100}%`, opacity: opacity(index) }" /></div>
    </li>
  </ul>
</template>
