<script setup>
import { computed } from 'vue';

// items: [{ label, value }] — горизонтальные полоски вместо пончика
const props = defineProps({ items: { type: Array, default: () => [] }, accent: Boolean });
const max = computed(() => Math.max(1, ...props.items.map((i) => i.value)));
</script>

<template>
  <ul class="list">
    <li v-for="i in items" :key="i.label" class="flex flex-col gap-2 py-3">
      <div class="flex justify-between text-sm">
        <span>{{ i.label }}</span>
        <span class="num text-secondary">{{ i.value }}</span>
      </div>
      <div class="bar" :class="{ accent }"><span :style="{ width: `${(i.value / max) * 100}%` }" /></div>
    </li>
  </ul>
</template>
