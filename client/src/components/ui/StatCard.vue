<script setup>
defineProps({
  title: String,
  value: [String, Number],
  hint: String,
  icon: String,
});
</script>

<template>
  <div class="card bg-base-200">
    <div class="card-body p-5">
      <div class="flex items-center justify-between">
        <span class="text-sm opacity-70">{{ title }}</span>
        <span class="text-2xl">{{ icon }}</span>
      </div>
      <div class="text-3xl font-black">{{ value }}</div>
      <div v-if="hint" class="text-xs opacity-60">{{ hint }}</div>
    </div>
  </div>
</template>
