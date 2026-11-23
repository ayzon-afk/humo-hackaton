<script setup>
defineProps({ text: { type: String, default: 'Пока пусто' } });
</script>

<template>
  <div class="text-center py-10 opacity-60">
    <div class="text-4xl mb-2">📭</div>
    <p>{{ text }}</p>
    <slot />
  </div>
</template>
