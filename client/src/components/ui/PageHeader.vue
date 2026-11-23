<script setup>
defineProps({ title: String, subtitle: String });
</script>

<template>
  <div class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2"><slot /></div>
  </div>
</template>
