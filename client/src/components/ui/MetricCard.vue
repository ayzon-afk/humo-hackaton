<script setup>
defineProps({
  label: String,
  value: [String, Number],
  hint: String,
  size: { type: String, default: 'md' }, // md | xl
});
</script>

<template>
  <div class="card card-body flex flex-col gap-1">
    <span class="metric-label">{{ label }}</span>
    <span class="metric-value" :class="{ 'metric-value-xl': size === 'xl' }">{{ value }}</span>
    <span v-if="hint" class="text-xs text-tertiary">{{ hint }}</span>
    <slot />
  </div>
</template>
