<script setup>
defineProps({ rows: { type: Number, default: 5 } });
</script>

<template>
  <div class="flex flex-col gap-4 p-6" aria-busy="true" aria-label="Загрузка">
    <div v-for="n in rows" :key="n" class="flex items-center gap-4">
      <div class="skeleton h-4 flex-1" />
      <div class="skeleton h-4 w-24" />
      <div class="skeleton h-4 w-16" />
    </div>
  </div>
</template>
