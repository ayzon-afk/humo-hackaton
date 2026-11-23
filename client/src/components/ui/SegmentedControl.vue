<script setup>
// options: [{ value, label, count? }]
const model = defineModel();
defineProps({ options: { type: Array, required: true } });
</script>

<template>
  <div class="segmented" role="group">
    <button v-for="o in options" :key="o.value ?? 'all'" type="button" :aria-pressed="model === o.value" @click="model = o.value">
      {{ o.label }}<span v-if="o.count != null" class="count">{{ o.count }}</span>
    </button>
  </div>
</template>
